package service_test

import (
	"net/http"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
)

func TestGetBitriseYMLAsJSONHandler(t *testing.T) {
	performControllerTest(t, controllerTestCase{
		httpMethod:      "GET",
		url:             "/api/bitrise-yml.json",
		handler:         service.GetBitriseYMLAsJSONHandler,
		bitriseFileName: "bitrise.yml",
		bitriseFileContent: "format_version: 1.3.1\n" +
			"default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git",
		expectedStatusCode: http.StatusOK,
		expectedBody: `{` +
			`"format_version":"1.3.1","default_step_lib_source":"https://github.com/bitrise-io/bitrise-steplib.git"` +
			`,"project_type":"","app":{}` +
			`}` + "\n",
	})
}
