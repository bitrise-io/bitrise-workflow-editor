package service

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"gopkg.in/yaml.v1"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise/models"
	"github.com/bitrise-io/go-utils/fileutil"
)

// GetBitriseYMLHandler ...
func GetBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath.Get())
	if err != nil {
		respondWithErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	if err := utility.ValidateBitriseConfigAndSecret(contStr, config.MinimalValidSecrets); err != nil {
		log.Printf(" [!] Validation error: %s", err)
		respondWithError(w, ErrorWithYMLResponse{Error: err, BitriseYML: contStr})
		return
	}

	w.Header().Set("Content-Type", "text/yaml")
	w.WriteHeader(200)
	if _, err := w.Write([]byte(contStr)); err != nil {
		log.Println(" [!] Exception: Failed to write YAML response: Error: ", err)
	}
}

// PostBitriseYMLHandler ...
func PostBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {

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

	if err := utility.ValidateBitriseConfigAndSecret(string(content), config.MinimalValidSecrets); err != nil {
		respondWithError(w, ErrorWithYMLResponse{Error: err, BitriseYML: string(content)})
		return
	}

	if err := fileutil.WriteBytesToFile(config.BitriseYMLPath.Get(), content); err != nil {
		respondWithErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	respondWithJSON(w, 200, SimpleResponse{Message: "OK"})
}

// GetBitriseYMLAsJSONHandler ...
func GetBitriseYMLAsJSONHandler(w http.ResponseWriter, r *http.Request) {

	contBytes, err := fileutil.ReadBytesFromFile(config.BitriseYMLPath.Get())
	if err != nil {
		respondWithErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	if err := utility.ValidateBitriseConfigAndSecret(string(contBytes), config.MinimalValidSecrets); err != nil {
		respondWithError(w, ErrorWithYMLResponse{Error: err, BitriseYML: string(contBytes)})
		return
	}

	var yamlContObj models.BitriseDataModel
	if err := yaml.Unmarshal(contBytes, &yamlContObj); err != nil {
		respondWithErrorMessage(w, "Failed to parse the content of bitrise.yml file (invalid YML), error: %s", err)
		return
	}

	if err := yamlContObj.Normalize(); err != nil {
		respondWithErrorMessage(w, "Failed to normalize the content of bitrise.yml file (invalid YML), error: %s", err)
		return
	}

	respondWithJSON(w, 200, yamlContObj)
}

// PostBitriseYMLFromJSONHandler ...
func PostBitriseYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {

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

	if err := utility.ValidateBitriseConfigAndSecret(string(contAsYAML), config.MinimalValidSecrets); err != nil {
		respondWithError(w, ErrorWithYMLResponse{Error: err, BitriseYML: string(contAsYAML)})
		return
	}

	if err := fileutil.WriteBytesToFile(config.BitriseYMLPath.Get(), contAsYAML); err != nil {
		respondWithErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	respondWithJSON(w, 200, SimpleResponse{Message: "OK"})
}
