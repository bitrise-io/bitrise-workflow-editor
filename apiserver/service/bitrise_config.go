package service

import (
	"encoding/json"
	"fmt"
	"net/http"

	"gopkg.in/yaml.v2"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
)

// GetBitriseYMLHandler ...
func GetBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath.Get())
	if err != nil {
		log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath.Get(), err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	if err := utility.ValidateBitriseConfigAndSecret(contStr, config.MinimalValidSecrets); err != nil {
		log.Errorf("Validation error: %s", err)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(contStr, err.Error()))
		return
	}

	w.Header().Set("Content-Type", "text/yaml")
	w.WriteHeader(200)
	if _, err := w.Write([]byte(contStr)); err != nil {
		log.Errorf("Failed to write yml response, error: %s", err)
	}
}

// PostBitriseYMLHandler ...
func PostBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
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

	fmt.Printf("reqObj.BitriseYML: %s\n", reqObj.BitriseYML)

	if err := utility.ValidateBitriseConfigAndSecret(reqObj.BitriseYML, config.MinimalValidSecrets); err != nil {
		log.Errorf("Validation error: %s", err)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(reqObj.BitriseYML, err.Error()))
		return
	}

	if err := fileutil.WriteStringToFile(config.BitriseYMLPath.Get(), reqObj.BitriseYML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, NewResponse("OK"))
}

// GetBitriseYMLAsJSONHandler ...
func GetBitriseYMLAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath.Get())
	if err != nil {
		log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath.Get(), err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	if err := utility.ValidateBitriseConfigAndSecret(contStr, config.MinimalValidSecrets); err != nil {
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

	RespondWithJSON(w, 200, yamlContObj)
}

// PostBitriseYMLFromJSONHandler ...
func PostBitriseYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
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

	if err := utility.ValidateBitriseConfigAndSecret(string(contAsYAML), config.MinimalValidSecrets); err != nil {
		log.Errorf("Validation error: %s", err)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(string(contAsYAML), err.Error()))
		return
	}

	if err := fileutil.WriteBytesToFile(config.BitriseYMLPath.Get(), contAsYAML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, NewResponse("OK"))
}
