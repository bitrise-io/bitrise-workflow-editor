package service

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/pathutil"
	"github.com/stretchr/testify/require"
)

func TestGetSecretsAsJSONHandler(t *testing.T) {
	tmpDir, err := pathutil.NormalizedOSTempDirPath("_GetSecretsAsJSONHandler_")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, os.RemoveAll(tmpDir))
	}()

	bitriseSecretsPth := filepath.Join(tmpDir, ".bitrise.secrets.yml")
	bitriseSecretsContent := `envs:
- KEY: Value`
	require.NoError(t, fileutil.WriteStringToFile(bitriseSecretsPth, bitriseSecretsContent))
	require.NoError(t, config.SecretsYMLPath.Set(bitriseSecretsPth))

	req, err := http.NewRequest("GET", "/api/secrets", nil)
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(GetSecretsAsJSONHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	require.Equal(t, "{\"envs\":[{\"KEY\":\"Value\",\"opts\":{}}]}\n", rr.Body.String())
}

func TestPostSecretsYMLFromJSONHandler(t *testing.T) {
	tmpDir, err := pathutil.NormalizedOSTempDirPath("_PostSecretsYMLFromJSONHandler_")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, os.RemoveAll(tmpDir))
	}()

	bitriseSecretsPth := filepath.Join(tmpDir, ".bitrise.secrets.yml")
	bitriseConfigContent := `{
    "envs":[{"KEY":"Value","opts":{}}]
}`
	require.NoError(t, config.SecretsYMLPath.Set(bitriseSecretsPth))

	req, err := http.NewRequest("POST", "/api/secrets", bytes.NewBuffer([]byte(bitriseConfigContent)))
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(PostSecretsYMLFromJSONHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	require.Equal(t, "{\"message\":\"OK\"}\n", rr.Body.String())
}
