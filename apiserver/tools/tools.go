package tools

import (
	"fmt"

	envmanModels "github.com/bitrise-io/envman/models"
	"github.com/bitrise-io/go-utils/log"
	stepman "github.com/bitrise-io/stepman/cli"
	stepmanModels "github.com/bitrise-io/stepman/models"
)

type stepmanLogger struct {
}

func (l stepmanLogger) Warnf(format string, v ...interface{}) {
	log.Warnf(format, v...)
}

// StepmanStepInfo ...
func StepmanStepInfo(library, id, version string) (stepmanModels.StepInfoModel, error) {
	stepInfo, err := stepman.QueryStepInfo(library, id, version, stepmanLogger{})
	if err != nil {
		return stepmanModels.StepInfoModel{}, fmt.Errorf("failed to get step info: %w", err)
	}

	// fix: json: unsupported type: map[interface {}]interface {}
	normalizedInputs := []envmanModels.EnvironmentItemModel{}
	for _, input := range stepInfo.Step.Inputs {
		if err := input.Normalize(); err != nil {
			return stepmanModels.StepInfoModel{}, err
		}
		normalizedInputs = append(normalizedInputs, input)
	}
	stepInfo.Step.Inputs = normalizedInputs

	normalizedOutputs := []envmanModels.EnvironmentItemModel{}
	for _, output := range stepInfo.Step.Outputs {
		if err := output.Normalize(); err != nil {
			return stepmanModels.StepInfoModel{}, err
		}
		normalizedOutputs = append(normalizedOutputs, output)
	}
	stepInfo.Step.Outputs = normalizedOutputs
	// ---

	return stepInfo, nil
}

// StepmanLocalLibraryInfos ...
func StepmanLocalLibraryInfos() ([]stepmanModels.SteplibInfoModel, error) {
	stepLibInfos, err := stepman.Collections()
	if err != nil {
		return []stepmanModels.SteplibInfoModel{}, fmt.Errorf("failed to get steplib spec: %w", err)
	}
	return stepLibInfos, nil
}

// StepmanSetupLibrary ...
func StepmanSetupLibrary(libraryURI string) error {
	if err := stepman.Setup(libraryURI, "", stepmanLogger{}); err != nil {
		return fmt.Errorf("failed to setup library (%s): %w", libraryURI, err)
	}

	return nil
}
