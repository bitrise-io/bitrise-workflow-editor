package service

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/pathutil"
	"github.com/stretchr/testify/require"
)

func TestGetBitriseYMLHandler(t *testing.T) {
	tmpDir, err := pathutil.NormalizedOSTempDirPath("_GetBitriseYMLHandler_")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, os.RemoveAll(tmpDir))
	}()

	bitriseConfigPth := filepath.Join(tmpDir, "bitrise.yml")
	bitriseConfigContent := `format_version: 1.3.1
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git`
	require.NoError(t, fileutil.WriteStringToFile(bitriseConfigPth, bitriseConfigContent))
	require.NoError(t, config.BitriseYMLPath.Set(bitriseConfigPth))

	req, err := http.NewRequest("GET", "/api/bitrise-yml", nil)
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(GetBitriseYMLHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	require.Equal(t, bitriseConfigContent, rr.Body.String())
}

func TestPostBitriseYMLHandler(t *testing.T) {
	tmpDir, err := pathutil.NormalizedOSTempDirPath("_PostBitriseYMLHandler_")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, os.RemoveAll(tmpDir))
	}()

	bitriseConfigPth := filepath.Join(tmpDir, "bitrise.yml")
	type RequestModel struct {
		BitriseYML string `json:"bitrise_yml"`
	}
	bitriseConfigContent := `format_version: "1.3.1"
default_step_lib_source: "https://github.com/bitrise-io/bitrise-steplib.git"`
	body := RequestModel{
		BitriseYML: bitriseConfigContent,
	}
	bodyBytes, err := json.Marshal(body)
	require.NoError(t, err)

	require.NoError(t, config.BitriseYMLPath.Set(bitriseConfigPth))

	req, err := http.NewRequest("POST", "/api/bitrise-yml", bytes.NewBuffer([]byte(bodyBytes)))
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(PostBitriseYMLHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	require.Equal(t, "{\"message\":\"OK\"}\n", rr.Body.String())
}

func TestGetBitriseYMLAsJSONHandler(t *testing.T) {
	tmpDir, err := pathutil.NormalizedOSTempDirPath("_GetBitriseYMLAsJSONHandler_")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, os.RemoveAll(tmpDir))
	}()

	bitriseConfigPth := filepath.Join(tmpDir, "bitrise.yml")
	bitriseConfigContent := `format_version: 1.3.1
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git`
	require.NoError(t, fileutil.WriteStringToFile(bitriseConfigPth, bitriseConfigContent))
	require.NoError(t, config.BitriseYMLPath.Set(bitriseConfigPth))

	req, err := http.NewRequest("GET", "/api/bitrise-yml.json", nil)
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(GetBitriseYMLAsJSONHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	require.Equal(t, "{\"format_version\":\"1.3.1\",\"default_step_lib_source\":\"https://github.com/bitrise-io/bitrise-steplib.git\",\"project_type\":\"\",\"app\":{}}\n", rr.Body.String())
}

func TestPostBitriseYMLFromJSONHandler(t *testing.T) {
	tmpDir, err := pathutil.NormalizedOSTempDirPath("_PostBitriseYMLFromJSONHandler_")
	require.NoError(t, err)
	defer func() {
		require.NoError(t, os.RemoveAll(tmpDir))
	}()

	bitriseConfigPth := filepath.Join(tmpDir, "bitrise.yml")
	bitriseConfig := models.BitriseDataModel{
		FormatVersion:        "1.3.1",
		DefaultStepLibSource: "https://github.com/bitrise-io/bitrise-steplib.git",
	}
	type RequestModel struct {
		BitriseYML models.BitriseDataModel `json:"bitrise_yml"`
	}

	body := RequestModel{BitriseYML: bitriseConfig}
	bodyBytes, err := json.Marshal(body)
	require.NoError(t, err)

	require.NoError(t, config.BitriseYMLPath.Set(bitriseConfigPth))

	req, err := http.NewRequest("POST", "/api/bitrise-yml.json", bytes.NewBuffer(bodyBytes))
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(PostBitriseYMLFromJSONHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	require.Equal(t, "{\"message\":\"OK\"}\n", rr.Body.String())
}
