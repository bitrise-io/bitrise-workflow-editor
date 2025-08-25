package apiserver

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"runtime"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise-workflow-editor/version"
	"github.com/bitrise-io/go-utils/command"
	"github.com/bitrise-io/go-utils/log"
  "github.com/bitrise-io/go-utils/pathutil"
)

func chooseFreePort() (string, error) {
	address, err := net.ResolveTCPAddr("tcp", "localhost:0")
	if err != nil {
		return "", err
	}

	listener, err := net.ListenTCP("tcp", address)
	if err != nil {
		return "", err
	}
	defer func() {
		if err := listener.Close(); err != nil {
			log.Errorf("Failed to close port, error: %s", err)
		}
	}()
	port := listener.Addr().(*net.TCPAddr).Port
	return fmt.Sprintf("%d", port), nil
}

// LaunchServer ...
func LaunchServer() error {
	port := os.Getenv("PORT")
	if port == "" {
		var err error
		if port, err = chooseFreePort(); err != nil {
			return fmt.Errorf("Failed to find free port, error: %s", err)
		}
	}

	log.Printf("Starting API server at http://localhost:%s", port)

	isServeFilesThroughMiddlemanServer := (utility.EnvString("USE_DEV_SERVER", "false") == "true")
	if isServeFilesThroughMiddlemanServer {
		log.Printf(" (!) Serving non api resources through middleman server!")
	}

	config.BitriseYMLPath = utility.EnvString("BITRISE_CONFIG", "bitrise.yml")
	config.SecretsYMLPath = utility.EnvString("BITRISE_SECRETS", ".bitrise.secrets.yml")

  // Check for the existence of the secrets file, if it doesn't exist create an empty one
  if isExist, err := pathutil.IsPathExists(config.SecretsYMLPath); err != nil {
    log.Errorf("Failed to check .bitrise.secrets.yml file, error: %s", err)
  } else if !isExist {
    if err := os.WriteFile(config.SecretsYMLPath, []byte("envs: []"), 0644); err != nil {
      return fmt.Errorf("Failed to create empty secrets file, error: %s", err)
    }
    log.Printf("Created empty secrets file at %s", config.SecretsYMLPath)
  }


	if _, err := SetupRoutes(isServeFilesThroughMiddlemanServer); err != nil {
		return fmt.Errorf("Failed to setup routes, error: %s", err)
	}

	{
		openCmd := "open"
		if runtime.GOOS == "linux" {
			openCmd = "xdg-open"
		}
		workflowEditorURL := fmt.Sprintf("http://localhost:%s/%s/", port, version.VERSION)
		log.Printf("Workflow editor URL: %s", workflowEditorURL)
		if err := command.NewWithStandardOuts(openCmd, workflowEditorURL).Run(); err != nil {
			log.Printf(" [!] Failed to open workflow editor in browser, error: %s", err)
		}
	}

	if err := http.ListenAndServe("localhost:"+port, nil); err != nil {
		return fmt.Errorf("Can't start HTTP listener: %v", err)
	}
	return nil
}
