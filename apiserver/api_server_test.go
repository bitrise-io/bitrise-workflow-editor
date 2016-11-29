package apiserver

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

func Test_validateBitriseConfigAndSecret(t *testing.T) {
	validConfigs := []string{
		minimalValidBitriseYML,
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
		minimalValidSecrets,
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
				require.NoError(t, validateBitriseConfigAndSecret(aValidConfig, aValidSecret))
			}
		}
	}

	t.Log("Invalid configs - empty")
	{
		{
			require.EqualError(t,
				validateBitriseConfigAndSecret(``, minimalValidSecrets),
				"Validation failed: Config validation error: ")
		}

		{
			require.True(t,
				strings.HasPrefix(
					validateBitriseConfigAndSecret(`{}`, minimalValidSecrets).Error(),
					"Failed to parse bitrise validate output, error: json: cannot unmarshal number into Go value of type apiserver.BitriseCLIValidateOutputModel | 'bitrise validate' command output: ",
				),
			)
		}
	}

	t.Log("Invalid configs - 1")
	{
		validationErr := validateBitriseConfigAndSecret(`format_version: 1.3.0
app:
  envs:
  - A
`, minimalValidSecrets)

		require.EqualError(t, validationErr,
			"Validation failed: Config validation error: Failed to get config (bitrise.yml) from base 64 data, err: Failed to parse bitrise config, error: yaml: unmarshal errors:\n  line 4: cannot unmarshal !!str `A` into models.EnvironmentItemModel")
	}

	t.Log("Invalid configs - missing format_version")
	{
		validationErr := validateBitriseConfigAndSecret(`
app:
  envs:
  - KEY_ONE: value one
workflows:
  empty_wf:
    steps: []
`, minimalValidSecrets)

		require.True(t,
			strings.HasPrefix(
				validationErr.Error(),
				"Failed to parse bitrise validate output, error: json: cannot unmarshal number into Go value of type apiserver.BitriseCLIValidateOutputModel | 'bitrise validate' command output: ",
			),
		)
	}

	t.Log("Invalid secrets - empty")
	{
		{
			validationErr := validateBitriseConfigAndSecret(minimalValidBitriseYML, "")
			require.EqualError(t, validationErr, "Validation failed: Secret validation error: ")
		}
	}

	t.Log("Invalid secrets - envs as empty hash")
	{
		validationErr := validateBitriseConfigAndSecret(minimalValidBitriseYML, "envs: {}")
		require.EqualError(t, validationErr, "Validation failed: Secret validation error: Failed to get inventory from base 64 data, err: yaml: unmarshal errors:\n  line 1: cannot unmarshal !!map into []models.EnvironmentItemModel")
	}

	t.Log("Invalid secrets - envs as hash with value")
	{
		validationErr := validateBitriseConfigAndSecret(minimalValidBitriseYML, `envs:
  KEY_ONE: value one`)
		require.EqualError(t, validationErr, "Validation failed: Secret validation error: Failed to get inventory from base 64 data, err: yaml: unmarshal errors:\n  line 2: cannot unmarshal !!map into []models.EnvironmentItemModel")
	}
}
