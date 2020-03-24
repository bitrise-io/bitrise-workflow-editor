package service_test

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/pathutil"
	uuid "github.com/satori/go.uuid"
	"github.com/stretchr/testify/require"
)

type controllerTestCase struct {
	httpMethod         string
	url                string
	handler            func(http.ResponseWriter, *http.Request)
	bitriseFileName    string
	bitriseFileContent string
	requestBody        string
	expectedStatusCode int
	expectedBody       string
}

func performControllerTest(t *testing.T, tc controllerTestCase) {
	folderName := uuid.NewV4().String()
	tmpDir, err := pathutil.NormalizedOSTempDirPath(folderName)
	require.NoError(t, err)
	defer func() {
		require.NoError(t, os.RemoveAll(tmpDir))
	}()
	var bitriseConfigPth string
	if tc.bitriseFileName != "" {
		bitriseConfigPth = filepath.Join(tmpDir, tc.bitriseFileName)
		if tc.bitriseFileName == "bitrise.yml" {
			require.NoError(t, config.BitriseYMLPath.Set(bitriseConfigPth))
		}
		if tc.bitriseFileName == ".bitrise.secrets.yml" {
			require.NoError(t, config.SecretsYMLPath.Set(bitriseConfigPth))
		}
	}
	if bitriseConfigPth != "" && tc.bitriseFileContent != "" && tc.httpMethod == "GET" {
		require.NoError(t, fileutil.WriteStringToFile(bitriseConfigPth, tc.bitriseFileContent))
	}

	fmt.Println(tc.requestBody)
	req, err := http.NewRequest(tc.httpMethod, tc.url, bytes.NewBuffer([]byte(tc.requestBody)))
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	h := http.HandlerFunc(tc.handler)

	h.ServeHTTP(rr, req)

	require.Equal(t, tc.expectedStatusCode, rr.Code, rr.Body.String())
	require.Equal(t, tc.expectedBody, rr.Body.String())
}
