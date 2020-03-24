package service

import (
	"net/http"

	"gopkg.in/yaml.v2"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	envmanModels "github.com/bitrise-io/envman/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
	"github.com/bitrise-io/go-utils/pathutil"
	core "github.com/bitrise-io/workflow-editor-core"
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

	if _, err := core.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, string(contBytes)); err != nil {
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
			meta := core.YmlToJSONKeyTypeConversion(opts.Meta)
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
