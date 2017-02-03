package tools

import (
	"errors"
	"fmt"

	yaml "gopkg.in/yaml.v2"

	"github.com/bitrise-io/go-utils/command"
	stepmanModels "github.com/bitrise-io/stepman/models"
)

// StepmanLocalLibraryInfos ...
func StepmanLocalLibraryInfos() ([]stepmanModels.SteplibInfoModel, error) {
	type StepmanCollectionsOutputModel struct {
		Data  *([]stepmanModels.SteplibInfoModel) `json:"data,omitempty" yaml:"data,omitempty"`
		Error string                              `json:"error,omitempty" yaml:"error,omitempty"`
	}

	cmd := command.New("bitrise", "stepman", "collections", "--format", "json")
	out, err := cmd.RunAndReturnTrimmedCombinedOutput()
	if err != nil {
		return []stepmanModels.SteplibInfoModel{}, fmt.Errorf("failed to get steplib spec, out: %s, error: %s", out, err)
	}

	var output StepmanCollectionsOutputModel
	if err := yaml.Unmarshal([]byte(out), &output); err != nil {
		return []stepmanModels.SteplibInfoModel{}, fmt.Errorf("failed to parse stepman collections output (%s), error: %s", out, err)
	}

	if output.Error != "" {
		return []stepmanModels.SteplibInfoModel{}, errors.New(output.Error)
	}

	if output.Data == nil {
		return []stepmanModels.SteplibInfoModel{}, errors.New("empty output data")
	}

	return *output.Data, nil
}

// StepmanSetupLibrary ...
func StepmanSetupLibrary(libraryURI string) error {
	cmd := command.New("bitrise", "stepman", "setup", "--collection", libraryURI)
	out, err := cmd.RunAndReturnTrimmedCombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to setup library (%s), out: %s, err: %s", libraryURI, out, err)
	}

	return nil
}
