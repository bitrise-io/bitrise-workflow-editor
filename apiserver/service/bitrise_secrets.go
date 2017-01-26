package service

import (
	"encoding/json"
	"log"
	"net/http"

	"gopkg.in/yaml.v1"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	envmanModels "github.com/bitrise-io/envman/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/pathutil"
)

// GetSecretsAsJSONHandler ...
func GetSecretsAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	secretsYMLPth := config.SecretsYMLPath.Get()
	if isExist, err := pathutil.IsPathExists(secretsYMLPth); err != nil {
		respondWithErrorMessage(w, "Failed to check .bitrise.secrets.yml file, error: %s", err)
		return
	} else if !isExist {
		respondWithJSON(w, 200, envmanModels.EnvsSerializeModel{})
		return
	}

	contBytes, err := fileutil.ReadBytesFromFile(secretsYMLPth)
	if err != nil {
		respondWithErrorMessage(w, "Failed to read content of .bitrise.secrets.yml file, error: %s", err)
		return
	}

	if err := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, string(contBytes)); err != nil {
		respondWithErrorMessage(w, "Invalid secrets: %s", err)
		return
	}

	var respObj envmanModels.EnvsSerializeModel
	if err := yaml.Unmarshal(contBytes, &respObj); err != nil {
		respondWithErrorMessage(w, "Failed to parse the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		return
	}

	if err := respObj.Normalize(); err != nil {
		respondWithErrorMessage(w, "Failed to normalize the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		return
	}

	respondWithJSON(w, 200, respObj)
}

// PostSecretsYMLFromJSONHandler ...
func PostSecretsYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Println(" [!] Failed to close request body, error: ", err)
		}
	}()

	var reqObj envmanModels.EnvsSerializeModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		respondWithErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	contAsYAML, err := yaml.Marshal(reqObj)
	if err != nil {
		respondWithErrorMessage(w, "Failed to serialize bitrise_yml as YAML, error: %s", err)
		return
	}

	if err := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, string(contAsYAML)); err != nil {
		respondWithErrorMessage(w, "Invalid secrets: %s", err)
		return
	}

	if err := fileutil.WriteBytesToFile(config.SecretsYMLPath.Get(), contAsYAML); err != nil {
		respondWithErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	respondWithJSON(w, 200, SimpleResponse{Message: "OK"})
}
