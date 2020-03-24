package service

import (
	"encoding/json"
	"net/http"

	"github.com/bitrise-io/api-utils/httprequest"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	core "github.com/bitrise-io/workflow-editor-core"
	"gopkg.in/yaml.v2"
)

// BitriseConfigPostParams ...
type BitriseConfigPostParams struct {
	BitriseYML models.BitriseDataModel `json:"bitrise_yml"`
}

// PostBitriseYMLFromJSONHandler ...
func PostBitriseYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		log.Errorf("Empty request body")
		RespondWithJSONBadRequestErrorMessage(w, "Empty request body")
		return
	}
	defer httprequest.BodyCloseWithErrorLog(r)

	var reqObj BitriseConfigPostParams
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

	warnings, validationErr := core.ValidateBitriseConfigAndSecret(string(contAsYAML), config.MinimalValidSecrets)
	if validationErr != nil {
		log.Errorf("Validation error: %s", validationErr)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(string(contAsYAML), validationErr.Error()))
		return
	}

	if err := fileutil.WriteBytesToFile(config.BitriseYMLPath.Get(), contAsYAML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, core.ValidationResponse{Warnings: warnings})
}
