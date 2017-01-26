package service

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// Response ...
type Response struct {
	Message      string `json:"message,omitempty"`
	ErrorMessage string `json:"error,omitempty"`
	BitriseYML   string `json:"bitrise_yml,omitempty"`
}

// NewResponse ...
func NewResponse(format string, v ...interface{}) Response {
	return Response{
		Message: fmt.Sprintf(format, v...),
	}
}

// NewErrorResponse ...
func NewErrorResponse(format string, v ...interface{}) Response {
	return Response{
		ErrorMessage: fmt.Sprintf(format, v...),
	}
}

// NewErrorResponseWithConfig ...
func NewErrorResponseWithConfig(bitriseConfig string, format string, v ...interface{}) Response {
	return Response{
		BitriseYML:   bitriseConfig,
		ErrorMessage: fmt.Sprintf(format, v...),
	}
}

// RespondWithJSON ...
func RespondWithJSON(w http.ResponseWriter, httpStatusCode int, respModel interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatusCode)
	if err := json.NewEncoder(w).Encode(&respModel); err != nil {
		log.Println(" [!] Exception: RespondWith: Error: ", err)
	}
}

// RespondWithJSONBadRequestErrorMessage ...
func RespondWithJSONBadRequestErrorMessage(w http.ResponseWriter, format string, v ...interface{}) {
	RespondWithJSON(w, http.StatusBadRequest, NewErrorResponse(format, v...))
}
