package apiserver

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	rice "github.com/GeertJohan/go.rice"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/service"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise-workflow-editor/version"
	"github.com/bitrise-io/go-utils/log"
	"github.com/gorilla/mux"
)

// SetupRoutes ...
func SetupRoutes(isServeFilesThroughMiddlemanServer bool) (*mux.Router, error) {
	r := mux.NewRouter()

	r.HandleFunc("/api/bitrise-yml", wrapHandlerFunc(service.GetBitriseYMLHandler)).Methods("GET")
	r.HandleFunc("/api/bitrise-yml", wrapHandlerFunc(service.PostBitriseYMLHandler)).Methods("POST")

	r.HandleFunc("/api/bitrise-yml.json", wrapHandlerFunc(service.GetBitriseYMLAsJSONHandler)).Methods("GET")
	r.HandleFunc("/api/bitrise-yml.json", wrapHandlerFunc(service.PostBitriseYMLFromJSONHandler)).Methods("POST")

	// Modular config (include tree): resolve the tree from disk, save changed module files, and
	// merge the live tree. The FE drives these in local mode exactly like the hosted /config/tree.
	r.HandleFunc("/api/bitrise-yml/tree", wrapHandlerFunc(service.GetBitriseYMLTreeHandler)).Methods("GET")
	r.HandleFunc("/api/bitrise-yml/tree", wrapHandlerFunc(service.PostBitriseYMLTreeHandler)).Methods("POST")
	r.HandleFunc("/api/bitrise-yml/tree/merge", wrapHandlerFunc(service.PostBitriseYMLTreeMergeHandler)).Methods("POST")

	r.HandleFunc("/api/secrets", wrapHandlerFunc(service.GetSecretsAsJSONHandler)).Methods("GET")
	r.HandleFunc("/api/secrets", wrapHandlerFunc(service.PostSecretsYMLFromJSONHandler)).Methods("POST")

	r.HandleFunc("/api/default-outputs", wrapHandlerFunc(service.GetDefaultOutputsHandler)).Methods("GET")

	r.HandleFunc("/api/spec", wrapHandlerFunc(service.PostSpecHandler)).Methods("POST")
	r.HandleFunc("/api/step-info", wrapHandlerFunc(service.PostStepInfoHandler)).Methods("POST")

	r.HandleFunc("/api/connection", wrapHandlerFunc(service.DeleteConnectionHandler)).Methods("DELETE")
	r.HandleFunc("/api/connection", wrapHandlerFunc(service.PostConnectionHandler)).Methods("POST")

	r.HandleFunc("/api/cli/format", wrapHandlerFunc(service.PostFormatHandler)).Methods("POST")

	var assetServer http.Handler

	// Anything else: pass to the frontend
	if isServeFilesThroughMiddlemanServer {
		frontendServerHost := utility.EnvString("DEV_SERVER_HOST", config.DefaultFrontendHost)
		frontendServerPort := utility.EnvString("DEV_SERVER_PORT", config.DefaultFrontendPort)

		log.Printf("Starting reverse proxy for frontend => http://%s:%s", frontendServerHost, frontendServerPort)

		u, err := url.Parse("http://" + frontendServerHost + ":" + frontendServerPort + "/")
		if err != nil {
			return nil, fmt.Errorf("Failed to initialize frontend proxy URL, error: %s", err)
		}

		assetServer = httputil.NewSingleHostReverseProxy(u)
	} else {
		box := rice.MustFindBox("www")
		assetServer = http.StripPrefix("/"+version.VERSION+"/", http.FileServer(box.HTTPBox()))
	}
	//

	http.Handle("/", r)
	http.Handle("/"+version.VERSION+"/", assetServer)

	// The rest is dev-only convenience for MODE=WEBSITE running behind the
	// website-monolith asset proxy. In the CLI plugin (prod, rice-box assets)
	// none of this is used — users hit the Go server directly at /<version>/.
	if isServeFilesThroughMiddlemanServer {
		// Vite's base in website mode is /workflow_editor/<version>/; serve it
		// at that path so the dev proxy chain can forward unchanged.
		http.Handle("/workflow_editor/"+version.VERSION+"/", assetServer)

		// The website-monolith resolves the WFE version via the
		// workflow-editor-version LaunchDarkly flag (or the BITRISE_WORKFLOW_EDITOR_VERSION
		// env var, default "latest"), which rarely matches the version baked into the
		// local checkout. Rewrite the version segment to the actual local version so
		// the WFE serves regardless of which version the caller asked for.
		r.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			prefix := "/"
			tail := strings.TrimPrefix(req.URL.Path, "/")
			if strings.HasPrefix(tail, "workflow_editor/") {
				prefix = "/workflow_editor/"
				tail = strings.TrimPrefix(tail, "workflow_editor/")
			}
			slash := strings.Index(tail, "/")
			if slash < 0 {
				http.NotFound(w, req)
				return
			}
			req.URL.Path = prefix + version.VERSION + "/" + tail[slash+1:]
			assetServer.ServeHTTP(w, req)
		})
	}

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
