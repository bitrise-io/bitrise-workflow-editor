package service

import (
	"net/http"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
)

// GetBitriseYMLHandler ...
func GetBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
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

	w.Header().Set("Content-Type", "text/yaml")
	w.WriteHeader(200)
	if _, err := w.Write([]byte(contStr)); err != nil {
		log.Errorf("Failed to write yml response, error: %s", err)
	}
}
