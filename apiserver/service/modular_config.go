package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise/v2/configmerge"
	bitriseLog "github.com/bitrise-io/bitrise/v2/log"
	"github.com/bitrise-io/bitrise/v2/log/corelog"
	"github.com/bitrise-io/bitrise/v2/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
)

type nopLogger struct{}

var _ bitriseLog.Logger = nopLogger{}

func (l nopLogger) Error(args ...interface{})                                 {}
func (l nopLogger) Errorf(format string, args ...interface{})                 {}
func (l nopLogger) Warn(args ...interface{})                                  {}
func (l nopLogger) Warnf(format string, args ...interface{})                  {}
func (l nopLogger) Info(args ...interface{})                                  {}
func (l nopLogger) Infof(format string, args ...interface{})                  {}
func (l nopLogger) Done(args ...interface{})                                  {}
func (l nopLogger) Donef(format string, args ...interface{})                  {}
func (l nopLogger) Print(args ...interface{})                                 {}
func (l nopLogger) Printf(format string, args ...interface{})                 {}
func (l nopLogger) Debug(args ...interface{})                                 {}
func (l nopLogger) Debugf(format string, args ...interface{})                 {}
func (l nopLogger) LogMessage(message string, level corelog.Level)            {}
func (l nopLogger) PrintBitriseStartedEvent(plan models.WorkflowRunPlan)      {}
func (l nopLogger) PrintStepStartedEvent(params bitriseLog.StepStartedParams) {}
func (l nopLogger) PrintStepFinishedEvent(params bitriseLog.StepFinishedParams) {}

func GetConfigFilesHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath)
	if err != nil {
		log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	isModular, err := configmerge.IsModularConfig(config.BitriseYMLPath)
	if err != nil {
		log.Warnf("Failed to check if config is modular: %s", err)
		isModular = false
	}

	if !isModular {
		tree := models.ConfigFileTreeModel{
			Path:     filepath.Base(config.BitriseYMLPath),
			Contents: contStr,
		}
		RespondWithJSON(w, http.StatusOK, tree)
		return
	}

	configReader, err := configmerge.NewConfigReader(nopLogger{})
	if err != nil {
		log.Errorf("Failed to create config reader: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to create config reader, error: %s", err)
		return
	}

	merger := configmerge.NewMerger(configReader, nopLogger{})
	_, configTree, err := merger.MergeConfig(config.BitriseYMLPath)
	if err != nil {
		log.Errorf("Failed to build config tree: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to build config tree, error: %s", err)
		return
	}

	RespondWithJSON(w, http.StatusOK, configTree)
}

func PostMergeConfigHandler(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		log.Errorf("Empty request body")
		RespondWithJSONBadRequestErrorMessage(w, "Empty request body")
		return
	}

	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Errorf("Failed to close request body, error: %s", err)
		}
	}()

	var configTree models.ConfigFileTreeModel
	if err := json.NewDecoder(r.Body).Decode(&configTree); err != nil {
		log.Errorf("Failed to decode request body: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to decode request body, error: %s", err)
		return
	}

	mergedYml, err := configTree.Merge()
	if err != nil {
		log.Errorf("Failed to merge config: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to merge config, error: %s", err)
		return
	}

	w.Header().Set("Content-Type", "text/yaml; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte(mergedYml)); err != nil {
		log.Errorf("Failed to write response: %s", err)
	}
}

func PostConfigFilesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		log.Errorf("Empty request body")
		RespondWithJSONBadRequestErrorMessage(w, "Empty request body")
		return
	}

	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Errorf("Failed to close request body, error: %s", err)
		}
	}()

	type FileToSave struct {
		Path     string `json:"path"`
		Contents string `json:"contents"`
	}
	type RequestModel struct {
		Files    []FileToSave              `json:"files"`
		TreeJSON *models.ConfigFileTreeModel `json:"config_tree,omitempty"`
	}

	var reqObj RequestModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to decode request body: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to decode request body, error: %s", err)
		return
	}

	if len(reqObj.Files) == 0 {
		RespondWithJSONBadRequestErrorMessage(w, "No files to save")
		return
	}

	if reqObj.TreeJSON != nil {
		mergedYml, err := reqObj.TreeJSON.Merge()
		if err != nil {
			log.Errorf("Failed to merge config for validation: %s", err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to merge config for validation, error: %s", err)
			return
		}

		warnings, validationErr := utility.ValidateBitriseConfigAndSecret(mergedYml, config.MinimalValidSecrets)
		if validationErr != nil {
			log.Errorf("Validation error: %s", validationErr)
			RespondWithJSON(w, http.StatusBadRequest, NewErrorResponse("Merged configuration is invalid: %s", validationErr.Error()))
			return
		}
		_ = warnings
	}

	absCwd, err := filepath.Abs(".")
	if err != nil {
		log.Errorf("Failed to resolve working directory: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to resolve working directory, error: %s", err)
		return
	}

	for _, file := range reqObj.Files {
		absFilePath, err := filepath.Abs(file.Path)
		if err != nil {
			log.Errorf("Failed to resolve file path (%s): %s", file.Path, err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to resolve file path (%s), error: %s", file.Path, err)
			return
		}

		if !strings.HasPrefix(absFilePath, absCwd+string(os.PathSeparator)) && absFilePath != absCwd {
			log.Errorf("File path (%s) is outside the project directory", file.Path)
			RespondWithJSONBadRequestErrorMessage(w, "File path (%s) is outside the project directory", file.Path)
			return
		}

		parentDir := filepath.Dir(absFilePath)
		if err := os.MkdirAll(parentDir, 0755); err != nil {
			log.Errorf("Failed to create parent directory for %s: %s", file.Path, err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to create directory for file (%s), error: %s", file.Path, err)
			return
		}

		if err := fileutil.WriteStringToFile(absFilePath, file.Contents); err != nil {
			log.Errorf("Failed to write file (%s): %s", file.Path, err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to write file (%s), error: %s", file.Path, err)
			return
		}

		log.Printf("Saved config file: %s", file.Path)
	}

	RespondWithJSON(w, http.StatusOK, NewResponse(fmt.Sprintf("Successfully saved %d file(s)", len(reqObj.Files))))
}
