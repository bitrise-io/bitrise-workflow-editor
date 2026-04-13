package service

import (
	"encoding/json"
	"net/http"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/tools"
	"github.com/bitrise-io/go-utils/log"
)

// PostStepInfoRequestBodyModel ...
type PostStepInfoRequestBodyModel struct {
	Library string `json:"library,omitempty"`
	ID      string `json:"id,omitempty"`
	Version string `json:"version,omitempty"`
}

// PostStepInfoHandler ...
func PostStepInfoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		log.Errorf("Empty body")
		RespondWithJSONBadRequestErrorMessage(w, "Empty body")
		return
	}

	var requestBody PostStepInfoRequestBodyModel
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&requestBody); err != nil {
		log.Errorf("Failed to read request body, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read request body, error: %s", err)
		return
	}

	stepInfo, err := tools.StepmanStepInfo(requestBody.Library, requestBody.ID, requestBody.Version)
	if err != nil {
		log.Errorf(err.Error())
		RespondWithJSONBadRequestErrorMessage(w, "%s", err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, stepInfo)
}
