package service

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"encoding/json"

	"github.com/bitrise-io/go-utils/command"
	stepmanModels "github.com/bitrise-io/stepman/models"
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

	type ResponseItemModel struct {
		URI  string                            `json:"uri,omitempty"`
		Spec stepmanModels.StepCollectionModel `json:"spec,omitempty"`
	}
	var response []ResponseItemModel

	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &response))

	found := false
	for _, responseItem := range response {
		if responseItem.URI == defaultSteplib {
			found = true
		}
	}

	require.Equal(t, true, found)
}
