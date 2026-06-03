package utility

import (
	"strings"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
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
		"",
		"#",
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
	validWithWarning :=
		`
format_version: 1.1.0
trigger_map:
- pattern: ci/quick
  workflow: _prepare_and_setup
workflows:
 _prepare_and_setup:
  description: desc
`

	t.Log("Valid combinations")
	{
		for _, aValidConfig := range validConfigs {
			for _, aValidSecret := range validSecrets {
				t.Log("Config: ", aValidConfig)
				t.Log("Secret: ", aValidSecret)
				warningItems, err := ValidateBitriseConfigAndSecret(aValidConfig, aValidSecret)
				require.NoError(t, err)
				require.Nil(t, warningItems)
			}
		}
	}

	t.Log("Valid config with warnings")
	{
		warnings, err := ValidateBitriseConfigAndSecret(validWithWarning,
			config.MinimalValidSecrets)
		require.NoError(t, err)
		require.Equal(t, "trigger item #1: utility workflow (_prepare_and_setup) defined as trigger target, but utility workflows can't be triggered directly", warnings.Config[0])
	}

	t.Log("Invalid configs - empty")
	{
		{
			_, err := ValidateBitriseConfigAndSecret(``, config.MinimalValidSecrets)
			require.Error(t, err)
			require.True(t, strings.Contains(err.Error(), "Validation failed: Config validation error: "), err.Error())
		}

		{
			_, err := ValidateBitriseConfigAndSecret(`{}`, config.MinimalValidSecrets)
			require.Error(t, err)
			require.True(t, strings.Contains(err.Error(), "Validation failed: Config validation error: failed to get Bitrise config (bitrise.yml) from base 64 data: failed to parse bitrise config, error: missing format_version"), err.Error())
		}
	}

	t.Log("Invalid configs - 1")
	{
		_, err := ValidateBitriseConfigAndSecret(`format_version: 1.3.0
app:
  envs:
  - A
`, config.MinimalValidSecrets)

		require.Error(t, err)
		require.True(t, strings.Contains(err.Error(), "Config validation error: failed to get Bitrise config (bitrise.yml) from base 64 data: failed to parse bitrise config, error: yaml: unmarshal errors:\n  line 4: cannot unmarshal !!str `A` into models.EnvironmentItemModel"), err.Error())
	}

	t.Log("Invalid configs - missing format_version")
	{
		_, err := ValidateBitriseConfigAndSecret(`
app:
  envs:
  - KEY_ONE: value one
workflows:
  empty_wf:
    steps: []
`, config.MinimalValidSecrets)

		require.Error(t, err)
		require.True(t, strings.Contains(err.Error(), "Validation failed: Config validation error: failed to get Bitrise config (bitrise.yml) from base 64 data: failed to parse bitrise config, error: missing format_version"), err.Error())
	}

	t.Log("Invalid secrets - envs as empty hash")
	{
		_, err := ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, "envs: {}")
		require.Error(t, err)
		require.True(t, strings.Contains(err.Error(), "Validation failed: Secret validation error: failed to get inventory from base 64 data, err: yaml: unmarshal errors:\n  line 1: cannot unmarshal !!map into []models.EnvironmentItemModel"), err.Error())
	}

	t.Log("Invalid secrets - envs as hash with value")
	{
		_, err := ValidateBitriseConfigAndSecret(config.MinimalValidBitriseYML, `envs:
  KEY_ONE: value one`)
		require.Error(t, err)
		require.True(t, strings.Contains(err.Error(), "Validation failed: Secret validation error: failed to get inventory from base 64 data, err: yaml: unmarshal errors:\n  line 2: cannot unmarshal !!map into []models.EnvironmentItemModel"), err.Error())
	}
}
