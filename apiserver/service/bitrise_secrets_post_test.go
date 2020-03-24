package service_test

import (
	"net/http"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
)

func TestPostSecretsYMLFromJSONHandler(t *testing.T) {
	performControllerTest(t, controllerTestCase{
		httpMethod:         "POST",
		url:                "/api/secrets",
		handler:            service.PostSecretsYMLFromJSONHandler,
		bitriseFileName:    ".bitrise.secrets.yml",
		requestBody:        `{"envs":[{"KEY":"Value","opts":{}}]}`,
		expectedStatusCode: http.StatusOK,
		expectedBody:       `{"warnings":null}` + "\n",
	})
}
