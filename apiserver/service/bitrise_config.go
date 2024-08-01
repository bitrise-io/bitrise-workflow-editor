package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"gopkg.in/yaml.v3"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise/models"
	envmanModels "github.com/bitrise-io/envman/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	stepmanModels "github.com/bitrise-io/stepman/models"
)

// GetBitriseYMLHandler ...
func GetBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath)
	if err != nil {
		log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
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

// PostBitriseYMLHandler ...
func PostBitriseYMLHandler(w http.ResponseWriter, r *http.Request) {
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

	type RequestModel struct {
		BitriseYML string `json:"bitrise_yml"`
	}
	var reqObj RequestModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	warnings, validationErr := utility.ValidateBitriseConfigAndSecret(reqObj.BitriseYML, config.MinimalValidSecrets)
	if validationErr != nil {
		log.Errorf("Validation error: %s", validationErr)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(reqObj.BitriseYML, validationErr.Error()))
		return
	}

	if err := fileutil.WriteStringToFile(config.BitriseYMLPath, reqObj.BitriseYML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, utility.ValidationResponse{Warnings: warnings})
}

// GetBitriseYMLAsJSONHandler ...
func GetBitriseYMLAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath)
	if err != nil {
		log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
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

	workflows, err := convertWorkflowElementTypes(yamlContObj.Workflows)
	if err != nil {
		log.Errorf("Failed to convert workflow types, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to convert workflow types")
		return
	}
	yamlContObj.Workflows = workflows

	triggerMap, err := convertTriggerMapElementTypes(yamlContObj.TriggerMap)
	if err != nil {
		log.Errorf("Failed to convert trigger map types, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to convert trigger map types")
		return
	}
	yamlContObj.TriggerMap = triggerMap

	RespondWithJSON(w, 200, yamlContObj)
}

// PostBitriseYMLFromJSONHandler ...
func PostBitriseYMLFromJSONHandler(w http.ResponseWriter, r *http.Request) {
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

	type RequestModel struct {
		BitriseYML models.BitriseDataModel `json:"bitrise_yml"`
	}
	var reqObj RequestModel
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	contAsYAML, err := yamlMarshal(reqObj.BitriseYML)
	if err != nil {
		log.Errorf("Failed to serialize bitrise_yml as YAML, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to serialize bitrise_yml as YAML, error: %s", err)
		return
	}

	warnings, validationErr := utility.ValidateBitriseConfigAndSecret(string(contAsYAML), config.MinimalValidSecrets)
	if validationErr != nil {
		log.Errorf("Validation error: %s", validationErr)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(string(contAsYAML), validationErr.Error()))
		return
	}

	if err := fileutil.WriteBytesToFile(config.BitriseYMLPath, contAsYAML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, utility.ValidationResponse{Warnings: warnings})
}

func convertMultiTypeTriggerItemType(value interface{}) interface{} {
	if v, ok := value.(string); ok {
		return v
	}
	if v, ok := value.(map[interface{}]interface{}); ok {
		for key, val := range v {
			if v, ok := key.(string); ok {
				return map[string]interface{}{v: val}
			}
		}
	}
	return value
}

func convertTriggerMapElementTypes(triggerMap models.TriggerMapModel) (models.TriggerMapModel, error) {
	for i, triggerMapItem := range triggerMap {
		triggerMap[i].PushBranch = convertMultiTypeTriggerItemType(triggerMapItem.PushBranch)
		triggerMap[i].Tag = convertMultiTypeTriggerItemType(triggerMapItem.Tag)
		triggerMap[i].PullRequestSourceBranch = convertMultiTypeTriggerItemType(triggerMapItem.PullRequestSourceBranch)
		triggerMap[i].PullRequestTargetBranch = convertMultiTypeTriggerItemType(triggerMapItem.PullRequestTargetBranch)
		triggerMap[i].PullRequestLabel = convertMultiTypeTriggerItemType(triggerMapItem.PullRequestLabel)
		triggerMap[i].CommitMessage = convertMultiTypeTriggerItemType(triggerMapItem.CommitMessage)
		triggerMap[i].ChangedFiles = convertMultiTypeTriggerItemType(triggerMapItem.ChangedFiles)
	}
	return triggerMap, nil
}

func convertWorkflowElementTypes(workflows map[string]models.WorkflowModel) (map[string]models.WorkflowModel, error) {
	for wfKey, wf := range workflows {
		err := convertWorkflowMetadataType(&wf)
		if err != nil {
			return nil, err
		}

		for stepListItemIdx, stepListItem := range wf.Steps {
			key, step, with, err := stepListItem.GetStepListItemKeyAndValue()
			if err != nil {
				return nil, err
			}

			if key != models.StepListItemWithKey {
				step, err = convertStepType(step)
				if err != nil {
					return nil, err
				}

				stepID := key
				wf.Steps[stepListItemIdx] = map[string]interface{}{stepID: step}
			} else {
				for stepIdx, stepItem := range with.Steps {
					stepID, step, err := stepItem.GetStepIDAndStep()
					if err != nil {
						return nil, err
					}

					step, err = convertStepType(step)
					if err != nil {
						return nil, err
					}

					with.Steps[stepIdx] = map[string]stepmanModels.StepModel{stepID: step}
				}
				wf.Steps[stepListItemIdx] = map[string]interface{}{key: with}
			}
		}

		workflows[wfKey] = wf
	}

	return workflows, nil
}

func convertStepType(step stepmanModels.StepModel) (stepmanModels.StepModel, error) {
	if len(step.Inputs) == 0 {
		return step, nil
	}
	for inputIdx, input := range step.Inputs {
		convertedInput, err := convertStepInputMetadataType(input)
		if err != nil {
			return stepmanModels.StepModel{}, err
		}
		step.Inputs[inputIdx] = convertedInput
	}
	return step, nil
}

func convertWorkflowMetadataType(workflow *models.WorkflowModel) error {
	if workflow.Meta == nil {
		return nil
	}

	wfMeta, ok := ymlToJSONKeyTypeConversion(workflow.Meta).(map[string]interface{})
	if !ok {
		return errors.New("Failed to convert metadata")
	}
	workflow.Meta = wfMeta
	return nil
}

func convertStepInputMetadataType(input envmanModels.EnvironmentItemModel) (envmanModels.EnvironmentItemModel, error) {
	if input["opts"] == nil {
		return input, nil
	}
	opts, ok := input["opts"].(envmanModels.EnvironmentItemOptionsModel)
	if !ok {
		return envmanModels.EnvironmentItemModel{}, fmt.Errorf("Failed to convert opts: %#v", input["opts"])
	}
	if opts.Meta == nil {
		return input, nil
	}
	meta, ok := ymlToJSONKeyTypeConversion(opts.Meta).(map[string]interface{})
	if !ok {
		return envmanModels.EnvironmentItemModel{}, errors.New("Failed to convert metadata")
	}
	opts.Meta = meta
	input["opts"] = opts
	return input, nil
}
