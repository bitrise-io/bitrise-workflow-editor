package service

import (
	"net/http"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	"gopkg.in/yaml.v2"
)

// GetBitriseYMLAsJSONHandler ...
func GetBitriseYMLAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath.Get())
	if err != nil {
		log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath.Get(), err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read content of bitrise.yml file, error: %s", err)
		return
	}

	if _, err := utility.ValidateBitriseConfigAndSecret(contStr, config.MinimalValidSecrets); err != nil {
		log.Errorf("Validation error: %s", err)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(contStr, err.Error()))
		return
	}

	var yamlContObj models.BitriseDataModel
	if err := yaml.Unmarshal([]byte(contStr), &yamlContObj); err != nil {
		log.Errorf("Failed to parse the content of bitrise.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to parse the content of bitrise.yml file (invalid YML), error: %s", err)
		return
	}

	if err := yamlContObj.Normalize(); err != nil {
		log.Errorf("Failed to normalize the content of bitrise.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to normalize the content of bitrise.yml file (invalid YML), error: %s", err)
		return
	}

	RespondWithJSON(w, 200, yamlContObj)
}
