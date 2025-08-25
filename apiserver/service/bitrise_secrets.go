package service

import (
	"encoding/json"
	"net/http"
	"os"

	"gopkg.in/yaml.v2"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	envmanModels "github.com/bitrise-io/envman/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	"github.com/bitrise-io/go-utils/pathutil"
)

func ymlToJSONKeyTypeConversion(i interface{}) interface{} {
	switch x := i.(type) {
	case map[string]interface{}:
		m2 := map[string]interface{}{}
		for k, v := range x {
			m2[k] = ymlToJSONKeyTypeConversion(v)
		}
		return m2
	case map[interface{}]interface{}:
		m2 := map[string]interface{}{}
		for k, v := range x {
			m2[k.(string)] = ymlToJSONKeyTypeConversion(v)
		}
		return m2
	case []interface{}:
		for i, v := range x {
			x[i] = ymlToJSONKeyTypeConversion(v)
		}
	}
	return i
}

func createEmptySecretsFileIfNotExist() error {
  secretsYMLPth := config.SecretsYMLPath

  if isExist, err := pathutil.IsPathExists(secretsYMLPth); err != nil {
    log.Errorf("Failed to check .bitrise.secrets.yml file, error: %s", err)
    return err
  } else if !isExist {
    if err := os.WriteFile(secretsYMLPth, []byte("envs: []"), 0644); err != nil {
      log.Errorf("Failed to create .bitrise.secrets.yml file, error: %s", err)
      return err
    }
    log.Printf("Created .bitrise.secrets.yml file")
  }

  return nil
}

// GetSecretsAsJSONHandler ...
func GetSecretsAsJSONHandler(w http.ResponseWriter, r *http.Request) {
	secretsYMLPth := config.SecretsYMLPath

  if isExist, err := pathutil.IsPathExists(secretsYMLPth); err != nil {
		log.Errorf("Failed to check .bitrise.secrets.yml file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to check .bitrise.secrets.yml file, error: %s", err)
		return
	} else if !isExist {
		log.Errorf(".bitrise.secrets.yml does not exist")
		RespondWithJSON(w, 200, envmanModels.EnvsSerializeModel{ Envs: []envmanModels.EnvironmentItemModel{} })
		return
	}

	contBytes, err := fileutil.ReadBytesFromFile(secretsYMLPth)
	if err != nil {
		log.Errorf("Failed to read content of .bitrise.secrets.yml file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read content of .bitrise.secrets.yml file, error: %s", err)
		return
	}

	if _, err := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, string(contBytes)); err != nil {
		log.Errorf("Validation error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Invalid secrets: %s", err)
		return
	}

	var envsSerializeModel envmanModels.EnvsSerializeModel
	if err := yaml.Unmarshal(contBytes, &envsSerializeModel); err != nil {
		log.Errorf("Failed to parse the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to parse the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		return
	}

	if err := envsSerializeModel.Normalize(); err != nil {
		log.Errorf("Failed to normalize the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to normalize the content of .bitrise.secrets.yml file (invalid YML), error: %s", err)
		return
	}

	for i, env := range envsSerializeModel.Envs {
		opts, err := env.GetOptions()
		if err != nil {
			log.Errorf("Failed to get options of env: %v, error: %s", env, err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to get options of env: %v, error: %s", env, err)
			return
		}
		if len(opts.Meta) > 0 {
			meta := ymlToJSONKeyTypeConversion(opts.Meta)
			casted, ok := meta.(map[string]interface{})
			if ok {
				opts.Meta = casted
			} else {
				log.Errorf("Failed to cast env mate property: %v, error: %s", opts.Meta, err)
				RespondWithJSONBadRequestErrorMessage(w, "Failed to cast env mate property: %v, error: %s", opts.Meta, err)
				return
			}
		}
		env[envmanModels.OptionsKey] = opts
		envsSerializeModel.Envs[i] = env
	}

	RespondWithJSON(w, 200, envsSerializeModel)
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

  // Check if the secrets file exists, if not create an empty one
  if err := createEmptySecretsFileIfNotExist(); err != nil {
    log.Errorf("Failed to create empty .bitrise.secrets.yml file, error: %s", err)
    RespondWithJSONBadRequestErrorMessage(w, "Failed to create empty .bitrise.secrets.yml file, error: %s", err)
    return
  }

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

	warnings, validationErr := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, string(contAsYAML))
	if validationErr != nil {
		log.Errorf("Invalid secrets: %s", validationErr)
		RespondWithJSONBadRequestErrorMessage(w, "Invalid secrets: %s", validationErr)
		return
	}

	if err := fileutil.WriteBytesToFile(config.SecretsYMLPath, contAsYAML); err != nil {
		log.Errorf("Failed to write content into file, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to write content into file, error: %s", err)
		return
	}

	RespondWithJSON(w, 200, utility.ValidationResponse{Warnings: warnings})
}
