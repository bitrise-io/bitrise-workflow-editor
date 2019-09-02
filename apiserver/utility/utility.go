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

	fmt.Println("`" + secretsConfig + "`" + secretsConfigBase64 + "`")
	fmt.Println("`" + bitriseConfig + "`" + bitriseConfigBase64 + "`")

	_, bitriseWarns, bitriseErr := cli.CreateBitriseConfigFromCLIParams(bitriseConfigBase64, "")
	_, secretsErr := cli.CreateInventoryFromCLIParams(secretsConfigBase64, "")

	errorStrs := []string{}
	if bitriseErr != nil {
		errorStrs = append(errorStrs, "Config validation error: "+bitriseErr.Error())
	}
	if secretsErr != nil {
		errorStrs = append(errorStrs, "Secret validation error: "+secretsErr.Error())
	} else {
		if secretsConfigBase64 == "" {
			errorStrs = append(errorStrs, "Secret validation error: Validation failed: Empty secrets configuration")
		}
	}

	if len(errorStrs) > 0 {
		return nil, fmt.Errorf("Validation failed: %s", strings.Join(errorStrs, " | "))
	}

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
