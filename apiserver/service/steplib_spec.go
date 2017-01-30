package service

import (
	"net/http"

	"gopkg.in/yaml.v2"

	"encoding/json"

	"github.com/bitrise-io/depman/pathutil"
	"github.com/bitrise-io/go-utils/command"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	stepmanModels "github.com/bitrise-io/stepman/models"
)

// GetSpecHandler ...
func GetSpecHandler(w http.ResponseWriter, r *http.Request) {
	cmd := command.New("bitrise", "stepman", "collections", "--format", "json")
	out, err := cmd.RunAndReturnTrimmedCombinedOutput()
	if err != nil {
		log.Errorf("Failed to get steplib spec, out: %s, error: %s", out, err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to get steplib spec, out: %s, error: %s", out, err)
		return
	}

	type OutputModel struct {
		Data  *([]stepmanModels.SteplibInfoModel) `json:"data,omitempty" yaml:"data,omitempty"`
		Error string                              `json:"error,omitempty" yaml:"error,omitempty"`
	}

	var output OutputModel
	if err := yaml.Unmarshal([]byte(out), &output); err != nil {
		log.Errorf("Failed to parse the output (%s), error: %s", out, err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to parse the output (%s), error: %s", out, err)
		return
	}

	if output.Error != "" {
		log.Errorf("Failed to get steplib spec, error: %s", output.Error)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to get steplib spec, error: %s", output.Error)
		return
	}

	if output.Data == nil {
		log.Errorf("Missing output data")
		RespondWithJSONBadRequestErrorMessage(w, "Missing output data")
		return
	}

	type ResponseItemModel struct {
		URI  string                            `json:"uri,omitempty"`
		Spec stepmanModels.StepCollectionModel `json:"spec,omitempty"`
	}

	response := []ResponseItemModel{}

	steplibInfos := *output.Data
	for _, steplibInfo := range steplibInfos {
		if exist, err := pathutil.IsPathExists(steplibInfo.SpecPath); err != nil {
			log.Errorf("Failed to check if spec exists at: %s, error: %s", steplibInfo.SpecPath, err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to check if spec exists at: %s, error: %s", steplibInfo.SpecPath, err)
			return
		} else if !exist {
			log.Errorf("Spec not exists at: %s", steplibInfo.SpecPath)
			RespondWithJSONBadRequestErrorMessage(w, "Spec not exists at: %s", steplibInfo.SpecPath)
			return
		}

		specBytes, err := fileutil.ReadBytesFromFile(steplibInfo.SpecPath)
		if err != nil {
			log.Errorf("Failed to read spec at: %s, error: %s", steplibInfo.SpecPath, err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to read spec at: %s, error: %s", steplibInfo.SpecPath, err)
			return
		}

		var spec stepmanModels.StepCollectionModel
		if err := json.Unmarshal(specBytes, &spec); err != nil {
			log.Errorf("Failed to read serialize spec, error: %s", err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to read serialize spec, error: %s", err)
			return
		}

		response = append(response, ResponseItemModel{
			URI:  steplibInfo.URI,
			Spec: spec,
		})
	}

	RespondWithJSON(w, http.StatusOK, response)
}
