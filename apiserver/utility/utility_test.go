package utility

import (
	"strings"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/stretchr/testify/require"
)

func TestValidateBitriseConfigAndSecret(t *testing.T) {
	validConfigs := []string{
		config.MinimalValidBitriseYML,
		//
		`format_version: 1.3.0
app:
  envs:
  - KEY_ONE: value one
workflows:
  empty_wf:
    steps: []
`,
		//
	}
	validSecrets := []string{
		config.MinimalValidSecrets,
		" ",
		"\n",
		"{}",
		"envs:",
		"envs: ",
		`envs: []`,
		//
		`envs: 
- SECRET_ONE: secret value one`,
		//
		`envs: 
- SECRET_ONE: secret value one
`,
		//
	}

	t.Log("Valid combinations")
	{
		for _, aValidConfig := range validConfigs {
			for _, aValidSecret := range validSecrets {
				t.Log("Config: ", aValidConfig)
				t.Log("Secret: ", aValidSecret)
				require.NoError(t, utility.ValidateBitriseConfigAndSecret(aValidConfig, aValidSecret))
			}
		}
	}

	t.Log("Invalid configs - empty")
	{
		{
			require.EqualError(t,
				utility.ValidateBitriseConfigAndSecret(``, config.MinimalValidSecrets),
				"Validation failed: Config validation error: ")
		}

		{
			err := utility.ValidateBitriseConfigAndSecret(`{}`, config.MinimalValidSecrets)
			require.True(t,
				strings.HasPrefix(
					err.Error(),
					"Failed to parse bitrise validate output, error: json: cannot unmarshal number into Go value of type utility.BitriseCLIValidateOutputModel | 'bitrise validate' command output: ",
				), err.Error(),
			)
		}
	}

	t.Log("Invalid configs - 1")
	{
		validationErr := utility.ValidateBitriseConfigAndSecret(`format_version: 1.3.0
app:
  envs:
  - A
`, config.MinimalValidSecrets)

		require.EqualError(t, validationErr,
			"Validation failed: Config validation error: Failed to get config (bitrise.yml) from base 64 data, err: Failed to parse bitrise config, error: yaml: unmarshal errors:\n  line 4: cannot unmarshal !!str `A` into models.EnvironmentItemModel")
	}

	t.Log("Invalid configs - missing format_version")
	{
		validationErr := utility.ValidateBitriseConfigAndSecret(`
app:
  envs:
  - KEY_ONE: value one
workflows:
  empty_wf:
    steps: []
`, config.MinimalValidSecrets)

		require.True(t,
			strings.HasPrefix(
				validationErr.Error(),
				"Failed to parse bitrise validate output, error: json: cannot unmarshal number into Go value of type utility.BitriseCLIValidateOutputModel | 'bitrise validate' command output: ",
			),
		)
	}

	t.Log("Invalid secrets - empty")
	{
		{
			validationErr := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, "")
			require.EqualError(t, validationErr, "Validation failed: Secret validation error: ")
		}
	}

	t.Log("Invalid secrets - envs as empty hash")
	{
		validationErr := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, "envs: {}")
		require.EqualError(t, validationErr, "Validation failed: Secret validation error: Failed to get inventory from base 64 data, err: yaml: unmarshal errors:\n  line 1: cannot unmarshal !!map into []models.EnvironmentItemModel")
	}

	t.Log("Invalid secrets - envs as hash with value")
	{
		validationErr := utility.ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, `envs:
  KEY_ONE: value one`)
		require.EqualError(t, validationErr, "Validation failed: Secret validation error: Failed to get inventory from base 64 data, err: yaml: unmarshal errors:\n  line 2: cannot unmarshal !!map into []models.EnvironmentItemModel")
	}
}
