package apiserver

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"io/ioutil"

	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/httputil"
	"github.com/gorilla/mux"
)

const defaultPort = "3654"

// SimpleResponse ...
type SimpleResponse struct {
	Message string `json:"message"`
}

func loadBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println()
	log.Println("=> Request")
	if r.Method != "GET" {
		respondWithErrorMessage(w, "Invalid method, only GET is accepted")
		return
	}

	type LoadBitriseYMLModel struct {
		BitriseYML string `json:"bitrise_yml"`
	}

	contStr, err := fileutil.ReadStringFromFile("./bitrise.yml")
	if err != nil {
		respondWithErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
	}

	respondWithJSON(w, 200, LoadBitriseYMLModel{BitriseYML: contStr})
}

func saveBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println()
	log.Println("=> Request")
	if r.Method != "POST" {
		respondWithErrorMessage(w, "Invalid method, only POST is accepted")
		return
	}

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
	//
	r.HandleFunc("/api/bitrise-yml", WrapHandlerFunc(saveBitriseYMLHandler)).
		Methods("POST")
	//
	r.HandleFunc("/", WrapHandlerFunc(rootHandler)).
		Methods("GET")
	//
	r.NotFoundHandler = http.HandlerFunc(WrapHandlerFunc(routeNotFoundHandler))
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
	contentType, err := httputil.GetSingleValueFromHeader("Content-Type", header)
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
