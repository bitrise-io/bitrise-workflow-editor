package service

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	stepmanModels "github.com/bitrise-io/stepman/models"
	"github.com/stretchr/testify/require"
)

func TestPostStepInfoHandler(t *testing.T) {
	t.Run("invalid body - empty", func(t *testing.T) {
		req, err := http.NewRequest("POST", "/api/step-info", nil)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusBadRequest, rr.Code, rr.Body.String())

		var response Response
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &response))

		require.Equal(t, "Empty body", response.ErrorMessage, rr.Body.String())
	})

	t.Run("invalid body - not a json", func(t *testing.T) {
		reader := strings.NewReader("not a json")
		req, err := http.NewRequest("POST", "/api/step-info", reader)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusBadRequest, rr.Code, rr.Body.String())

		var response Response
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &response))

		require.Equal(t, "Failed to read request body, error: invalid character 'o' in literal null (expecting 'u')", response.ErrorMessage, rr.Body.String())
	})

	t.Run("library step", func(t *testing.T) {
		body := PostStepInfoRequestBodyModel{
			Library: "https://github.com/bitrise-io/bitrise-steplib.git",
			ID:      "apk-info",
			Version: "1.0.4",
		}
		bytes, err := json.Marshal(body)
		require.NoError(t, err)

		reader := strings.NewReader(string(bytes))

		req, err := http.NewRequest("POST", "/api/step-info", reader)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())

		var stepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &stepInfo))

		require.Equal(t, stepInfo.ID, body.ID)
		require.Equal(t, stepInfo.Version, body.Version)
		require.Equal(t, stepInfo.Library, body.Library)
	})

	t.Run("local step", func(t *testing.T) {
		body := PostStepInfoRequestBodyModel{
			Library: "path",
			ID:      "./test-step",
			Version: "",
		}
		bytes, err := json.Marshal(body)
		require.NoError(t, err)

		reader := strings.NewReader(string(bytes))

		req, err := http.NewRequest("POST", "/api/step-info", reader)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())

		var stepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &stepInfo))

		require.Equal(t, stepInfo.ID, body.ID)
		require.Equal(t, stepInfo.Version, body.Version)
		require.Equal(t, stepInfo.Library, body.Library)
	})

	t.Run("git step", func(t *testing.T) {
		body := PostStepInfoRequestBodyModel{
			Library: "git",
			ID:      "https://github.com/bitrise-steplib/steps-xamarin-user-management.git",
			Version: "1.0.3",
		}
		bytes, err := json.Marshal(body)
		require.NoError(t, err)

		reader := strings.NewReader(string(bytes))

		req, err := http.NewRequest("POST", "/api/step-info", reader)
		require.NoError(t, err)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(PostStepInfoHandler)

		handler.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())

		var stepInfo stepmanModels.StepInfoModel
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &stepInfo))

		require.Equal(t, stepInfo.ID, body.ID)
		require.Equal(t, stepInfo.Version, body.Version)
		require.Equal(t, stepInfo.Library, body.Library)
	})
}
