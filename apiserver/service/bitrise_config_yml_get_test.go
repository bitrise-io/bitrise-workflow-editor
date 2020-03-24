package service_test

import (
	"net/http"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
)

func TestGetBitriseYMLHandler(t *testing.T) {
	performControllerTest(t, controllerTestCase{
		httpMethod:      "GET",
		url:             "/api/bitrise-yml",
		handler:         service.GetBitriseYMLHandler,
		bitriseFileName: "bitrise.yml",
		bitriseFileContent: "format_version: 1.3.1\n" +
			"default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git",
		expectedStatusCode: http.StatusOK,
		expectedBody: "format_version: 1.3.1\n" +
			"default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git",
	})
}
