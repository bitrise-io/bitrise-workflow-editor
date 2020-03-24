package service_test

import (
	"net/http"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
)

func TestPostBitriseYMLFromJSONHandler(t *testing.T) {
	performControllerTest(t, controllerTestCase{
		httpMethod:      "POST",
		url:             "/api/bitrise-yml.json",
		handler:         service.PostBitriseYMLFromJSONHandler,
		bitriseFileName: "bitrise.yml",
		requestBody: `{` +
			`"bitrise_yml":{` +
			`"format_version":"1.3.1","default_step_lib_source":"https://github.com/bitrise-io/bitrise-steplib.git"` +
			`,"project_type":"","app":{}` +
			`}` +
			`}`,
		expectedStatusCode: http.StatusOK,
		expectedBody:       `{"warnings":null}` + "\n",
	})
}
