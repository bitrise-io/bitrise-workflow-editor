package service

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// SimpleResponse ...
type SimpleResponse struct {
	Message string `json:"message"`
}

// ErrorWithYMLResponse ...
type ErrorWithYMLResponse struct {
	Error      error  `json:"error"`
	BitriseYML string `json:"bitrise_yml"`
}

func respondWithJSON(w http.ResponseWriter, httpStatusCode int, respModel interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatusCode)
	if err := json.NewEncoder(w).Encode(&respModel); err != nil {
		log.Println(" [!] Exception: RespondWith: Error: ", err)
	}
}

func respondWithErrorMessage(w http.ResponseWriter, format string, v ...interface{}) {
	respondWithJSON(w, 400, SimpleResponse{
		Message: fmt.Sprintf(format, v...),
	})
}

func respondWithError(w http.ResponseWriter, obj interface{}) {
	respondWithJSON(w, 400, obj)
}

func respondWithSuccessMessage(w http.ResponseWriter, format string, v ...interface{}) {
	respondWithSuccess(w, SimpleResponse{
		Message: fmt.Sprintf(format, v...),
	})
}

func respondWithSuccess(w http.ResponseWriter, obj interface{}) {
	respondWithJSON(w, 200, obj)
}

// StandardErrorRespModel ...
type StandardErrorRespModel struct {
	ErrorMessage string `json:"error"`
}

// -----------------
// --- Generic ---

// RespondWith ...
func RespondWith(w http.ResponseWriter, httpStatusCode int, respModel interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatusCode)
	if err := json.NewEncoder(w).Encode(&respModel); err != nil {
		log.Println(" [!] Exception: RespondWith: Error: ", err)
	}
}

// -----------------
// --- Successes ---

// RespondWithSuccessOK ...
func RespondWithSuccessOK(w http.ResponseWriter, respModel interface{}) {
	RespondWith(w, http.StatusOK, respModel)
}

// --------------
// --- Errors ---

// RespondWithBadRequestError ...
func RespondWithBadRequestError(w http.ResponseWriter, errMsg string) {
	RespondWithError(w, http.StatusBadRequest, errMsg)
}

// RespondWithNotFoundError ...
func RespondWithNotFoundError(w http.ResponseWriter, errMsg string) {
	RespondWithError(w, http.StatusNotFound, errMsg)
}

// RespondWithError ...
func RespondWithError(w http.ResponseWriter, httpErrCode int, errMsg string) {
	resp := StandardErrorRespModel{
		ErrorMessage: errMsg,
	}
	RespondWithErrorJSON(w, httpErrCode, resp)
}

// RespondWithErrorJSON ...
func RespondWithErrorJSON(w http.ResponseWriter, httpErrCode int, respModel interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpErrCode)
	if err := json.NewEncoder(w).Encode(&respModel); err != nil {
		log.Println(" [!] Exception: RespondWithErrorJSON: Error: ", err)
	}
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, 200, SimpleResponse{Message: "Hi! API is ready to serve!"})
}

func routeNotFoundHandler(w http.ResponseWriter, r *http.Request) {
	RespondWithNotFoundError(w, "Not Found")
}
