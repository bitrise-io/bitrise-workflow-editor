package apiserver

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/version"
	"github.com/stretchr/testify/require"
)

func TestEndpointURL(t *testing.T) {
	{
		urlStr := endpointURL("bitrise-yml")
		require.Equal(t, "/api/"+version.VERSION+"/bitrise-yml", urlStr)
	}

	{
		urlStr := endpointURL("bitrise-yml.json")
		require.Equal(t, "/api/"+version.VERSION+"/bitrise-yml.json", urlStr)
	}

	{
		urlStr := assetsBaseURL()
		require.Equal(t, "/assets/"+version.VERSION+"/", urlStr)
	}
}

func TestAssetsEndpoint(t *testing.T) {
	req, err := http.NewRequest("GET", "/assets/1.0.9/", nil)
	require.NoError(t, err)

	rr := httptest.NewRecorder()

	router, err := SetupRoutes(false)
	require.NoError(t, err)

	router.ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
}
