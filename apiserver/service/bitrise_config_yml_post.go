package service

import (
	"encoding/json"
	"net/http"

	"github.com/bitrise-io/api-utils/httprequest"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	core "github.com/bitrise-io/workflow-editor-core"
)

// BitriseConfigYMLPostParams ...
type BitriseConfigYMLPostParams struct {
	BitriseYML string `json:"bitrise_yml"`
}

// PostBitriseYMLHandler ...
func PostBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		log.Errorf("Empty request body")
		RespondWithJSONBadRequestErrorMessage(w, "Empty request body")
		return
	}
	defer httprequest.BodyCloseWithErrorLog(r)

	var reqObj BitriseConfigYMLPostParams
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	warnings, validationErr := core.ValidateBitriseConfigAndSecret(reqObj.BitriseYML, config.MinimalValidSecrets)
	if validationErr != nil {
		log.Errorf("Validation error: %s", validationErr)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(reqObj.BitriseYML, validationErr.Error()))
		return
	}

	if err := fileutil.WriteStringToFile(config.BitriseYMLPath.Get(), reqObj.BitriseYML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, core.ValidationResponse{Warnings: warnings})
}
