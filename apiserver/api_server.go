package apiserver

import (
	"fmt"
	"net/http"
	"runtime"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/go-utils/command"
	"github.com/bitrise-io/go-utils/log"
)

// LaunchServer ...
func LaunchServer() error {
	port := utility.EnvString("PORT", config.DefaultPort)
	log.Printf("Starting API server at http://localhost:%s", port)

	isServeFilesThroughMiddlemanServer := (utility.EnvString("USE_MIDDLEMAN_SERVER", "false") == "true")
	if isServeFilesThroughMiddlemanServer {
		log.Printf(" (!) Serving non api resources through middleman server!")
	}

	if err := config.BitriseYMLPath.Set(utility.EnvString("BITRISE_CONFIG", "bitrise.yml")); err != nil {
		return fmt.Errorf("Failed to set bitriseYMLPath, error: %s", err)
	}
	config.BitriseYMLPath.Freeze()

	if err := config.SecretsYMLPath.Set(utility.EnvString("BITRISE_SECRETS", ".bitrise.secrets.yml")); err != nil {
		return fmt.Errorf("Failed to set secretsYMLPath, error: %s", err)
	}
	config.SecretsYMLPath.Freeze()

	if err := setupRoutes(isServeFilesThroughMiddlemanServer); err != nil {
		return fmt.Errorf("Failed to setup routes, error: %s", err)
	}

	{
		openCmd := "open"
		if runtime.GOOS == "linux" {
			openCmd = "xdg-open"
		}
		workflowEditorURL := fmt.Sprintf("http://localhost:%s", port)
		log.Printf("Open workflow editor in browser ...")
		if err := command.NewWithStandardOuts(openCmd, workflowEditorURL).Run(); err != nil {
			log.Printf(" [!] Failed to open workflow editor in browser, error: %s", err)
		}
	}

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		return fmt.Errorf("Can't start HTTP listener: %v", err)
	}
	return nil
}
