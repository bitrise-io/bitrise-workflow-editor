package service

import (
	"encoding/json"
	"net/http"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	envmanModels "github.com/bitrise-io/envman/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	"gopkg.in/yaml.v2"
)

// PostSecretsYMLFromJSONHandler ...
func PostSecretsYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
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

	var reqObj envmanModels.EnvsSerializeModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	contAsYAML, err := yaml.Marshal(reqObj)
	if err != nil {
		log.Errorf("Failed to serialize env model as YAML, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to serialize env model as YAML, error: %s", err)
		return
	}

	warnings, validationErr := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, string(contAsYAML))
	if validationErr != nil {
		log.Errorf("Invalid secrets: %s", validationErr)
		RespondWithJSONBadRequestErrorMessage(w, "Invalid secrets: %s", validationErr)
		return
	}

	if err := fileutil.WriteBytesToFile(config.SecretsYMLPath.Get(), contAsYAML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, utility.ValidationResponse{Warnings: warnings})
}
