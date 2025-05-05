package tools

import (
  "fmt"
  "github.com/bitrise-io/envman/v2/models"

  logv2 "github.com/bitrise-io/go-utils/v2/log"
  stepman "github.com/bitrise-io/stepman/cli"
  stepmanModels "github.com/bitrise-io/stepman/models"
)

// StepmanStepInfo ...
func StepmanStepInfo(library, id, version string) (stepmanModels.StepInfoModel, error) {
  logger := logv2.NewLogger()
  stepInfo, err := stepman.QueryStepInfo(library, id, version, logger)
  if err != nil {
    return stepmanModels.StepInfoModel{}, fmt.Errorf("failed to get step info: %w", err)
  }

  // fix: json: unsupported type: map[interface {}]interface {}
  normalizedInputs := []models.EnvironmentItemModel{}
  for _, input := range stepInfo.Step.Inputs {
    if err := input.Normalize(); err != nil {
      return stepmanModels.StepInfoModel{}, err
    }
    normalizedInputs = append(normalizedInputs, input)
  }
  stepInfo.Step.Inputs = normalizedInputs

  normalizedOutputs := []models.EnvironmentItemModel{}
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
  logger := logv2.NewLogger()
  if err := stepman.Setup(libraryURI, "", logger); err != nil {
    return fmt.Errorf("failed to setup library (%s): %w", libraryURI, err)
  }

  return nil
}
