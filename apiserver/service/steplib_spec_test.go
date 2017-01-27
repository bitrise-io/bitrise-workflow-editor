package service

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"encoding/json"

	"github.com/bitrise-io/go-utils/command"
	"github.com/bitrise-io/stepman/models"
	"github.com/stretchr/testify/require"
)

func TestGetSpecHandler(t *testing.T) {
	defaultSteplib := "https://github.com/bitrise-io/bitrise-steplib.git"
	cmd := command.New("bitrise", "stepman", "setup", "--collection", defaultSteplib)
	require.NoError(t, cmd.Run())

	req, err := http.NewRequest("GET", "/api/spec", nil)
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(GetSpecHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())

	var steplibInfos []models.SteplibInfoModel
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &steplibInfos))

	found := false
	for _, steplibInfo := range steplibInfos {
		if steplibInfo.URI == defaultSteplib {
			found = true
		}
	}

	require.Equal(t, true, found)
}
