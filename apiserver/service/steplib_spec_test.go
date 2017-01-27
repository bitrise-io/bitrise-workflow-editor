package service

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"strings"

	"github.com/bitrise-io/go-utils/command"
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
	require.Equal(t, true, strings.Contains(rr.Body.String(), defaultSteplib))
}
