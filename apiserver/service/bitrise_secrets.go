package service

import (
	"encoding/json"
	"net/http"

	"gopkg.in/yaml.v2"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	envmanModels "github.com/bitrise-io/envman/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	"github.com/bitrise-io/go-utils/pathutil"
)

// GetSecretsAsJSONHandler ...
func GetSecretsAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	secretsYMLPth := config.SecretsYMLPath.Get()
	if isExist, err := pathutil.IsPathExists(secretsYMLPth); err != nil {
		log.Errorf("Failed to check .bitrise.secrets.yml file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to check .bitrise.secrets.yml file, error: %s", err)
		return
	} else if !isExist {
		log.Errorf(".bitrise.secrets.yml does not exist")
		RespondWithJSON(w, 200, envmanModels.EnvsSerializeModel{})
		return
	}

	contBytes, err := fileutil.ReadBytesFromFile(secretsYMLPth)
	if err != nil {
		log.Errorf("Failed to read content of .bitrise.secrets.yml file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read content of .bitrise.secrets.yml file, error: %s", err)
		return
	}

	if err := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, string(contBytes)); err != nil {
		log.Errorf("Validation error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Invalid secrets: %s", err)
		return
	}

	var respObj envmanModels.EnvsSerializeModel
	if err := yaml.Unmarshal(contBytes, &respObj); err != nil {
		log.Errorf("Failed to parse the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to parse the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		return
	}

	if err := respObj.Normalize(); err != nil {
		log.Errorf("Failed to normalize the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to normalize the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		return
	}

	RespondWithJSON(w, 200, respObj)
}

// PostSecretsYMLFromJSONHandler ...
func PostSecretsYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		log.Errorf("Empty request body")
		RespondWithJSONBadRequestErrorMessage(w, "Empty request body")
		return
	}

	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Errorf("Failed to close request body, error: %s", err)
		}
	}()

	var reqObj envmanModels.EnvsSerializeModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	contAsYAML, err := yaml.Marshal(reqObj)
	if err != nil {
		log.Errorf("Failed to serialize env model as YAML, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to serialize env model as YAML, error: %s", err)
		return
	}

	if err := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, string(contAsYAML)); err != nil {
		log.Errorf("Invalid secrets: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Invalid secrets: %s", err)
		return
	}

	if err := fileutil.WriteBytesToFile(config.SecretsYMLPath.Get(), contAsYAML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, NewResponse("OK"))
}
