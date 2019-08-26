package utility

import (
	"encoding/base64"
	// "encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/bitrise-io/bitrise/cli"
	// "github.com/bitrise-io/go-utils/command"
)

// ValidationResponse ...
type ValidationResponse struct {
	Warnings *WarningItems `json:"warnings"`
}

// WarningItems ...
type WarningItems struct {
	Config  []string `json:"config"`
	Secrets []string `json:"secrets"`
}

// ValidateBitriseConfigAndSecret ...
// `bitriseConfig` and `secretsConfig` can be either YML or JSON, both are accepted
func ValidateBitriseConfigAndSecret(bitriseConfig, secretsConfig string) (*WarningItems, error) {
	bitriseConfigBase64 := base64.StdEncoding.EncodeToString([]byte(bitriseConfig))
	secretsConfigBase64 := base64.StdEncoding.EncodeToString([]byte(secretsConfig))

	fmt.Println("`" + secretsConfig + "`"+secretsConfigBase64+"`")
	fmt.Println("`" + bitriseConfig + "`"+bitriseConfigBase64+"`")

	_, bitriseWarns, bitriseErr := cli.CreateBitriseConfigFromCLIParams(bitriseConfigBase64, "")
	_, secretsErr := cli.CreateInventoryFromCLIParams(secretsConfigBase64, "")

	// validateCmd := command.New("bitrise",
	// 	"-l=panic", "validate", "--format=json",
	// 	"--config-base64", bitriseConfigBase64,
	// 	"--inventory-base64", secretsConfigBase64)

	// combinedOut, cmdErr := validateCmd.RunAndReturnTrimmedCombinedOutput()

	// type BitriseCLIValidateItemModel struct {
	// 	IsValid  bool     `json:"is_valid"`
	// 	Error    string   `json:"error"`
	// 	Warnings []string `json:"warnings"`
	// }
	// type BitriseCLIValidateDataModel struct {
	// 	Config  BitriseCLIValidateItemModel `json:"config"`
	// 	Secrets BitriseCLIValidateItemModel `json:"secrets"`
	// }
	// type BitriseCLIValidateOutputModel struct {
	// 	Data  BitriseCLIValidateDataModel `json:"data"`
	// 	Error string                      `json:"error"`
	// }

	// var validationOutput BitriseCLIValidateOutputModel
	// if outputParseErr := json.NewDecoder(strings.NewReader(combinedOut)).Decode(&validationOutput); outputParseErr != nil {
	// 	if cmdErr != nil {
	// 		return nil, fmt.Errorf("Failed to run bitrise validate command, error: %s | 'bitrise validate' command output: %s", cmdErr, combinedOut)
	// 	}
	// 	return nil, fmt.Errorf("Failed to parse bitrise validate output, error: %s | 'bitrise validate' command output: %s", outputParseErr, combinedOut)
	// }

	errorStrs := []string{}
	if bitriseErr != nil {
		errorStrs = append(errorStrs, "Config validation error: "+bitriseErr.Error())
	}
	if secretsErr != nil {
		errorStrs = append(errorStrs, "Secret validation error: "+secretsErr.Error())
	}

	if len(errorStrs) > 0 {
		return nil, fmt.Errorf("Validation failed: %s", strings.Join(errorStrs, " | "))
	}

	// if len(validationOutput.Error) > 0 {
	// 	return nil, fmt.Errorf("bitrise validation command failed, error: %s", validationOutput.Error)
	// }

	// if cmdErr != nil {
	// 	return nil, fmt.Errorf("bitrise validation command failed, error: %s", cmdErr)
	// }

	warningItems := &WarningItems{Config: []string{}, Secrets: []string{}}
	if len(bitriseWarns) > 0 {
		warningItems.Config = bitriseWarns
	}
	if len(bitriseWarns) > 0 {
		warningItems.Secrets = bitriseWarns
	}

	return warningItems, nil
}

// EnvString ...
func EnvString(env, fallback string) string {
	e := os.Getenv(env)
	if e == "" {
		return fallback
	}
	return e
}
