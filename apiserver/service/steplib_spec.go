package service

import (
	"net/http"

	"gopkg.in/yaml.v2"

	"github.com/bitrise-io/go-utils/command"
	"github.com/bitrise-io/go-utils/log"
	stepmanModels "github.com/bitrise-io/stepman/models"
)

// GetSpecHandler ...
func GetSpecHandler(w http.ResponseWriter, r *http.Request) {
	cmd := command.New("bitrise", "stepman", "collections", "--format", "json")
	out, err := cmd.RunAndReturnTrimmedCombinedOutput()
	if err != nil {
		log.Errorf("Failed to get steplib spec, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to get steplib spec, error: %s", err)
		return
	}

	type OutputModel struct {
		Data  *([]stepmanModels.SteplibInfoModel) `json:"data,omitempty" yaml:"data,omitempty"`
		Error string                              `json:"error,omitempty" yaml:"error,omitempty"`
	}

	var output OutputModel
	if err := yaml.Unmarshal([]byte(out), &output); err != nil {
		log.Errorf("Failed to parse the output of stepman (%s), error: %s", out, err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to parse the output of stepman (%s), error: %s", out, err)
		return
	}

	if output.Error != "" {
		log.Errorf("Failed to get steplib spec, error: %s", output.Error)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to get steplib spec, error: %s", output.Error)
		return
	}

	if output.Data == nil {
		log.Errorf("Missing output data, error: %s", output.Error)
		RespondWithJSONBadRequestErrorMessage(w, "Missing output data, error: %s", output.Error)
		return
	}

	RespondWithJSON(w, 200, *output.Data)
}
