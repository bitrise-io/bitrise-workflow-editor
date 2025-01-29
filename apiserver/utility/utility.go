package utility

import (
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	"github.com/bitrise-io/bitrise/bitrise"
	"github.com/bitrise-io/bitrise/cli"
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

	_, bitriseWarns, bitriseErr := cli.CreateBitriseConfigFromCLIParams(bitriseConfigBase64, "", bitrise.ValidationTypeFull)
	var secretsErr error
	if secretsConfigBase64 != "" {
		_, secretsErr = cli.CreateInventoryFromCLIParams(secretsConfigBase64, "")
	}

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

	warningItems := WarningItems{}
	if len(bitriseWarns) > 0 {
		warningItems.Config = bitriseWarns
		return &warningItems, nil
	}

	return nil, nil
}

// EnvString ...
func EnvString(env, fallback string) string {
	e := os.Getenv(env)
	if e == "" {
		return fallback
	}
	return e
}
