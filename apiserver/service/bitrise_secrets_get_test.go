package service_test

import (
	"net/http"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
)

func TestGetSecretsAsJSONHandler(t *testing.T) {
	performControllerTest(t, controllerTestCase{
		httpMethod:      "GET",
		url:             "/api/secrets",
		handler:         service.GetSecretsAsJSONHandler,
		bitriseFileName: ".bitrise.secrets.yml",
		bitriseFileContent: "envs:\n" +
			"- KEY: Value",
		expectedStatusCode: http.StatusOK,
		expectedBody:       `{"envs":[{"KEY":"Value","opts":{}}]}` + "\n",
	})
}
