package apiserver

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	yaml "gopkg.in/yaml.v2"

	"io/ioutil"

	"github.com/bitrise-io/bitrise/models"
	"github.com/bitrise-io/go-utils/fileutil"
	bitriseHTTPUtil "github.com/bitrise-io/go-utils/httputil"
	"github.com/gorilla/mux"
)

const defaultPort = "3645"
const defaultFrontendPort = "4567"

// SimpleResponse ...
type SimpleResponse struct {
	Message string `json:"message"`
}

func loadBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile("./bitrise.yml")
	if err != nil {
		respondWithErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	w.Header().Set("Content-Type", "text/yaml")
	w.WriteHeader(200)
	if _, err := w.Write([]byte(contStr)); err != nil {
		log.Println(" [!] Exception: Failed to write YAML response: Error: ", err)
	}
}

func loadBitriseYMLAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	type LoadBitriseYMLModel struct {
		BitriseYML models.BitriseDataModel `json:"bitrise_yml"`
	}

	contBytes, err := fileutil.ReadBytesFromFile("./bitrise.yml")
	if err != nil {
		respondWithErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	var yamlContObj models.BitriseDataModel
	if err := yaml.Unmarshal(contBytes, &yamlContObj); err != nil {
		respondWithErrorMessage(w, "Failed to parse the content of bitrise.yml file (invalid YML), error: %s", err)
		return
	}

	respondWithJSON(w, 200, LoadBitriseYMLModel{BitriseYML: yamlContObj})
}

func defaultOutputsHandler(w http.ResponseWriter, r *http.Request) {
	type EnvItmModel map[string]string

	type ResponseModel struct {
		FromBitriseCLI []EnvItmModel `json:"from_bitrise_cli"`
	}

	respondWithJSON(w, 200, ResponseModel{
		FromBitriseCLI: []EnvItmModel{
			{"BITRISE_SOURCE_DIR": ""},
			{"BITRISE_DEPLOY_DIR": ""},
			{"BITRISE_BUILD_STATUS": ""},
			{"BITRISE_TRIGGERED_WORKFLOW_ID": ""},
			{"BITRISE_TRIGGERED_WORKFLOW_TITLE": ""},
			{"CI": ""},
			{"PR": ""},
		},
	})
}

// EnvItmModel ...
type EnvItmModel map[string]string

// SecretsModel ...
type SecretsModel struct {
	Envs []EnvItmModel `json:"envs"`
}

func loadSecretsAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	contBytes, err := fileutil.ReadBytesFromFile("./.bitrise.secrets.yml")
	if err != nil {
		respondWithErrorMessage(w, "Failed to read content of .bitrise.secrets.yml file, error: %s", err)
		return
	}

	var respObj SecretsModel
	if err := yaml.Unmarshal(contBytes, &respObj); err != nil {
		respondWithErrorMessage(w, "Failed to parse the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		return
	}

	respondWithJSON(w, 200, respObj)
}

func saveSecretsYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Println(" [!] Failed to close request body, error: ", err)
		}
	}()

	var reqObj SecretsModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		respondWithErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	contAsYAML, err := yaml.Marshal(reqObj)
	if err != nil {
		respondWithErrorMessage(w, "Failed to serialize bitrise_yml as YAML, error: %s", err)
		return
	}

	if err := fileutil.WriteBytesToFile("./.bitrise.secrets.yml", contAsYAML); err != nil {
		respondWithErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	respondWithJSON(w, 200, SimpleResponse{Message: "OK"})
}

func saveBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Println(" [!] Failed to close request body, error: ", err)
		}
	}()

	content, err := ioutil.ReadAll(r.Body)
	if err != nil {
		respondWithErrorMessage(w, "Failed to read content, error: %s", err)
		return
	}

	if err := fileutil.WriteBytesToFile("./bitrise.yml", content); err != nil {
		respondWithErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	respondWithJSON(w, 200, SimpleResponse{Message: "OK"})
}

func saveBitriseYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Println(" [!] Failed to close request body, error: ", err)
		}
	}()

	type RequestModel struct {
		BitriseYML models.BitriseDataModel `json:"bitrise_yml"`
	}
	var reqObj RequestModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		respondWithErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	contAsYAML, err := yaml.Marshal(reqObj.BitriseYML)
	if err != nil {
		respondWithErrorMessage(w, "Failed to serialize bitrise_yml as YAML, error: %s", err)
		return
	}

	if err := fileutil.WriteBytesToFile("./bitrise.yml", contAsYAML); err != nil {
		respondWithErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	respondWithJSON(w, 200, SimpleResponse{Message: "OK"})
}

// LaunchServer ...
func LaunchServer() error {
	port := envString("PORT", defaultPort)
	log.Printf("Starting API server at http://localhost:%s", port)

	setupRoutes()

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		return fmt.Errorf("Can't start HTTP listener: %v", err)
	}
	return nil
}

func setupRoutes() {
	r := mux.NewRouter()
	//
	r.HandleFunc("/api/bitrise-yml", WrapHandlerFunc(loadBitriseYMLHandler)).
		Methods("GET")
	r.HandleFunc("/api/bitrise-yml.json", WrapHandlerFunc(loadBitriseYMLAsJSONHandler)).
		Methods("GET")
	//
	r.HandleFunc("/api/bitrise-yml", WrapHandlerFunc(saveBitriseYMLHandler)).
		Methods("POST")
	r.HandleFunc("/api/bitrise-yml.json", WrapHandlerFunc(saveBitriseYMLFromJSONHandler)).
		Methods("POST")
	//
	r.HandleFunc("/api/default-outputs", WrapHandlerFunc(defaultOutputsHandler)).
		Methods("GET")
	//
	r.HandleFunc("/api/secrets", WrapHandlerFunc(loadSecretsAsJSONHandler)).
		Methods("GET")
	//
	r.HandleFunc("/api/secrets", WrapHandlerFunc(saveSecretsYMLFromJSONHandler)).
		Methods("POST")
	//

	//
	// Anything else: pass to the frontend
	frontendServerPort := envString("FRONTEND_PORT", defaultFrontendPort)
	log.Printf("Starting reverse proxy for frontend => http://localhost:%s", frontendServerPort)
	u, _ := url.Parse("http://localhost:" + frontendServerPort + "/")
	r.NotFoundHandler = httputil.NewSingleHostReverseProxy(u)

	//
	http.Handle("/", r)
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, 200, SimpleResponse{Message: "Hi! API is ready to serve!"})
}

func routeNotFoundHandler(w http.ResponseWriter, r *http.Request) {
	RespondWithNotFoundError(w, "Not Found")
}

func getContentTypeFromHeader(header http.Header) string {
	contentType, err := bitriseHTTPUtil.GetSingleValueFromHeader("Content-Type", header)
	if err != nil {
		return ""
	}
	return contentType
}

// WrapHandlerFunc ...
func WrapHandlerFunc(h func(http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
	requestWrap := func(w http.ResponseWriter, req *http.Request) {
		startTime := time.Now()
		h(w, req)
		log.Printf(" => %s: %s - %s (%s)", req.Method, req.RequestURI, time.Since(startTime), getContentTypeFromHeader(req.Header))
	}
	return requestWrap
}

// Trace ...
func Trace(name string, fn func()) {
	wrapFn := func() {
		startTime := time.Now()
		fn()
		log.Printf(" ==> TRACE (%s) - %s", name, time.Since(startTime))
	}
	wrapFn()
	return
}

func envString(env, fallback string) string {
	e := os.Getenv(env)
	if e == "" {
		return fallback
	}
	return e
}
