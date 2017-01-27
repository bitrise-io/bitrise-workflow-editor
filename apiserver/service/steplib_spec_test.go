package service

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"regexp"

	"github.com/bitrise-io/go-utils/command"
	"github.com/stretchr/testify/require"
)

func TestGetSpecHandler(t *testing.T) {
	cmd := command.New("bitrise", "stepman", "setup", "--collection", "https://github.com/bitrise-io/bitrise-steplib.git")
	require.NoError(t, cmd.Run())

	req, err := http.NewRequest("GET", "/api/spec", nil)
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(GetSpecHandler)

	handler.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())

	pattern := `{"uri":"https://github.com/bitrise-io/bitrise-steplib.git","spec_path":"/Users/.*/.stepman/step_collections/.*/spec/spec.json"}`
	re := regexp.MustCompile(pattern)
	match := re.FindString(rr.Body.String())
	require.NotEmpty(t, match, rr.Body.String())
}
