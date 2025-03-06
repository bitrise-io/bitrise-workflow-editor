package service

import "net/http"

// GetDefaultOutputsHandler ...
func GetDefaultOutputsHandler(w http.ResponseWriter, r *http.Request) {
	type EnvItmModel map[string]string

	type ResponseModel struct {
		FromBitriseCLI []EnvItmModel `json:"from_bitrise_cli"`
	}

	RespondWithJSON(w, 200, ResponseModel{
		FromBitriseCLI: []EnvItmModel{
			{"BITRISE_SOURCE_DIR": ""},
			{"BITRISE_DEPLOY_DIR": ""},
			{"BITRISE_TEST_RESULT_DIR": ""},
			{"BITRISE_BUILD_STATUS": ""},
			{"BITRISE_TRIGGERED_WORKFLOW_ID": ""},
			{"BITRISE_TRIGGERED_WORKFLOW_TITLE": ""},
			{"CI": ""},
			{"PR": ""},
			{"BITRISE_FAILED_STEP_TITLE": ""},
			{"BITRISE_FAILED_STEP_ERROR_MESSAGE": ""},
		},
	})
}
