package service

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"

	"gopkg.in/yaml.v2"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise/v2/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
)

// AppendBitriseConfigVersionHeader ...
func AppendBitriseConfigVersionHeader(w http.ResponseWriter, contStr string) {
	hash := sha256.Sum256([]byte(contStr))

	w.Header().Set("Bitrise-Config-Version", hex.EncodeToString(hash[:]))
}

// HasConfigVersionConflict ...
func HasConfigVersionConflict(r *http.Request, contStr string) bool {
	receivedVersion := r.Header.Get("Bitrise-Config-Version")
	if receivedVersion == "" {
		return false
	}

	hash := sha256.Sum256([]byte(contStr))

	return receivedVersion != hex.EncodeToString(hash[:])
}

// GetBitriseYMLHandler ...
func GetBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath)
	if err != nil {
		log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	AppendBitriseConfigVersionHeader(w, contStr)
	w.Header().Set("Content-Type", "text/yaml")
	w.WriteHeader(200)
	if _, err := w.Write([]byte(contStr)); err != nil {
		log.Errorf("Failed to write yml response, error: %s", err)
	}
}

// PostBitriseYMLHandler ...
func PostBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath)
	if err != nil {
		log.Warnf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
	} else if HasConfigVersionConflict(r, contStr) {
		w.WriteHeader(http.StatusConflict)
		return
	}

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

	type RequestModel struct {
		BitriseYML string `json:"bitrise_yml"`
	}
	var reqObj RequestModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	warnings, validationErr := utility.ValidateBitriseConfigAndSecret(reqObj.BitriseYML, config.MinimalValidSecrets)
	if validationErr != nil {
		log.Errorf("Validation error: %s", validationErr)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(reqObj.BitriseYML, validationErr.Error()))
		return
	}

	if err := fileutil.WriteStringToFile(config.BitriseYMLPath, reqObj.BitriseYML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, utility.ValidationResponse{Warnings: warnings})
}

// GetBitriseYMLAsJSONHandler ...
func GetBitriseYMLAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath)
	if err != nil {
		log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	if _, err := utility.ValidateBitriseConfigAndSecret(contStr, config.MinimalValidSecrets); err != nil {
		log.Errorf("Validation error: %s", err)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(contStr, err.Error()))
		return
	}

	var yamlContObj models.BitriseDataModel
	if err := yaml.Unmarshal([]byte(contStr), &yamlContObj); err != nil {
		log.Errorf("Failed to parse the content of bitrise.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to parse the content of bitrise.yml file (invalid YML), error: %s", err)
		return
	}

	if err := yamlContObj.Normalize(); err != nil {
		log.Errorf("Failed to normalize the content of bitrise.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to normalize the content of bitrise.yml file (invalid YML), error: %s", err)
		return
	}

	AppendBitriseConfigVersionHeader(w, contStr)
	RespondWithJSON(w, 200, yamlContObj)
}

// PostBitriseYMLFromJSONHandler ...
func PostBitriseYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath)
	if err != nil {
		log.Warnf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
	} else if HasConfigVersionConflict(r, contStr) {
		w.WriteHeader(http.StatusConflict)
		return
	}

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

	type RequestModel struct {
		BitriseYML models.BitriseDataModel `json:"bitrise_yml"`
	}
	var reqObj RequestModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	contAsYAML, err := yaml.Marshal(reqObj.BitriseYML)
	if err != nil {
		log.Errorf("Failed to serialize bitrise_yml as YAML, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to serialize bitrise_yml as YAML, error: %s", err)
		return
	}

	warnings, validationErr := utility.ValidateBitriseConfigAndSecret(string(contAsYAML), config.MinimalValidSecrets)
	if validationErr != nil {
		log.Errorf("Validation error: %s", validationErr)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(string(contAsYAML), validationErr.Error()))
		return
	}

	if err := fileutil.WriteBytesToFile(config.BitriseYMLPath, contAsYAML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, utility.ValidationResponse{Warnings: warnings})
}

// PostFormatHandler ...
func PostFormatHandler(w http.ResponseWriter, r *http.Request) {
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

	type RequestModel struct {
		BitriseYML string `json:"app_config_datastore_yaml"`
	}
	var reqObj RequestModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	yaml.FutureLineWrap()

	var model *yaml.MapSlice
	if err := yaml.Unmarshal([]byte(reqObj.BitriseYML), &model); err != nil {
		log.Errorf("Failed to parse the content of bitrise.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to parse the content of bitrise.yml file (invalid YML), error: %s", err)
		return
	}

	formattedBitriseYML, err := yaml.Marshal(model)
	if err != nil {
		log.Errorf("Failed to serialize bitrise_yml as YAML, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to serialize bitrise_yml as YAML, error: %s", err)
		return
	}

	w.Header().Set("Content-Type", "text/yaml")
	w.WriteHeader(200)

	if _, err := w.Write([]byte(formattedBitriseYML)); err != nil {
		log.Errorf("Failed to write yml response, error: %s", err)
	}
}
