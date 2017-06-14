package apiserver

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path/filepath"
	"time"

	"github.com/GeertJohan/go.rice"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise-workflow-editor/version"
	"github.com/bitrise-io/go-utils/log"
	"github.com/gorilla/mux"
)

func apiBaseURL() string {
	return filepath.Join("/api", version.VERSION)
}

func endpointURL(endpointName string) string {
	return filepath.Join(apiBaseURL(), endpointName)
}

func assetsBaseURL() string {
	return filepath.Join("/assets", version.VERSION) + "/"
}

// SetupRoutes ...
func SetupRoutes(isServeFilesThroughMiddlemanServer bool) (*mux.Router, error) {
	r := mux.NewRouter()

	r.HandleFunc(endpointURL("bitrise-yml"), wrapHandlerFunc(service.GetBitriseYMLHandler)).Methods("GET")
	r.HandleFunc(endpointURL("bitrise-yml"), wrapHandlerFunc(service.PostBitriseYMLHandler)).Methods("POST")

	r.HandleFunc(endpointURL("bitrise-yml.json"), wrapHandlerFunc(service.GetBitriseYMLAsJSONHandler)).Methods("GET")
	r.HandleFunc(endpointURL("bitrise-yml.json"), wrapHandlerFunc(service.PostBitriseYMLFromJSONHandler)).Methods("POST")

	r.HandleFunc(endpointURL("secrets"), wrapHandlerFunc(service.GetSecretsAsJSONHandler)).Methods("GET")
	r.HandleFunc(endpointURL("secrets"), wrapHandlerFunc(service.PostSecretsYMLFromJSONHandler)).Methods("POST")

	r.HandleFunc(endpointURL("default-outputs"), wrapHandlerFunc(service.GetDefaultOutputsHandler)).Methods("GET")

	r.HandleFunc(endpointURL("spec"), wrapHandlerFunc(service.PostSpecHandler)).Methods("POST")
	r.HandleFunc(endpointURL("step-info"), wrapHandlerFunc(service.PostStepInfoHandler)).Methods("POST")

	r.HandleFunc(endpointURL("connection"), wrapHandlerFunc(service.DeleteConnectionHandler)).Methods("DELETE")
	r.HandleFunc(endpointURL("connection"), wrapHandlerFunc(service.PostConnectionHandler)).Methods("POST")

	// Anything else: pass to the frontend
	if isServeFilesThroughMiddlemanServer {
		frontendServerHost := utility.EnvString("MIDDLEMAN_SERVER_HOST", config.DefaultFrontendHost)
		frontendServerPort := utility.EnvString("MIDDLEMAN_SERVER_PORT", config.DefaultFrontendPort)

		log.Printf("Starting reverse proxy for frontend => http://%s:%s", frontendServerHost, frontendServerPort)

		u, err := url.Parse("http://" + frontendServerHost + ":" + frontendServerPort + "/")
		if err != nil {
			return nil, fmt.Errorf("Failed to initialize frontend proxy URL, error: %s", err)
		}
		r.NotFoundHandler = httputil.NewSingleHostReverseProxy(u)
	} else {
		box := rice.MustFindBox("www")
		assetsServer := http.StripPrefix(assetsBaseURL(), http.FileServer(box.HTTPBox()))
		r.Handle(assetsBaseURL(), assetsServer)
	}
	//

	http.Handle("/", r)

	return r, nil
}

func wrapHandlerFunc(h func(http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
	requestWrap := func(w http.ResponseWriter, req *http.Request) {
		startTime := time.Now()
		h(w, req)

		log.Printf(" => %s: %s - %s (%s)", req.Method, req.RequestURI, time.Since(startTime), req.Header.Get("Content-Type"))
	}
	return requestWrap
}
