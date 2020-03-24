package service_test

import (
	"net/http"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
)

func TestPostBitriseYMLHandler(t *testing.T) {
	performControllerTest(t, controllerTestCase{
		httpMethod:      "POST",
		url:             "/api/bitrise-yml",
		handler:         service.PostBitriseYMLHandler,
		bitriseFileName: "bitrise.yml",
		requestBody: `{` +
			`"bitrise_yml":"` +
			`format_version: \"1.3.1\"\ndefault_step_lib_source: \"https://github.com/bitrise-io/bitrise-steplib.git\"` +
			`"}`,
		expectedStatusCode: http.StatusOK,
		expectedBody:       `{"warnings":null}` + "\n",
	})
}
