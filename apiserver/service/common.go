package service

import (
  "bytes"
  "encoding/json"
  "fmt"
  "gopkg.in/yaml.v3"
  "net/http"

  "github.com/bitrise-io/go-utils/log"
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
    log.Errorf("Exception: RespondWith: Error: %s", err)
  }
}

// RespondWithJSONBadRequestErrorMessage ...
func RespondWithJSONBadRequestErrorMessage(w http.ResponseWriter, format string, v ...interface{}) {
  RespondWithJSON(w, http.StatusBadRequest, NewErrorResponse(format, v...))
}

func yamlMarshal(v interface{}) ([]byte, error) {
  buf := bytes.Buffer{}
  enc := yaml.NewEncoder(&buf)
  // Set default indent here on the encoder
  enc.SetIndent(2)

  err := enc.Encode(v)
  if err != nil {
    return nil, err
  }
  return buf.Bytes(), nil
}
