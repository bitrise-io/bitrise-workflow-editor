package service

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetDefaultOutputsHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/default-outputs", nil)
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(GetDefaultOutputsHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	require.Equal(t, "{\"from_bitrise_cli\":[{\"BITRISE_SOURCE_DIR\":\"\"},{\"BITRISE_DEPLOY_DIR\":\"\"},{\"BITRISE_TEST_RESULT_DIR\":\"\"},{\"BITRISE_BUILD_STATUS\":\"\"},{\"BITRISE_TRIGGERED_WORKFLOW_ID\":\"\"},{\"BITRISE_TRIGGERED_WORKFLOW_TITLE\":\"\"},{\"CI\":\"\"},{\"PR\":\"\"},{\"BITRISE_FAILED_STEP_TITLE\":\"\"},{\"BITRISE_FAILED_STEP_ERROR_MESSAGE\":\"\"}]}\n", rr.Body.String())
}
