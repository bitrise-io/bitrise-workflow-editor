package apiserver

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"runtime"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise-workflow-editor/version"
	"github.com/bitrise-io/go-utils/command"
	"github.com/bitrise-io/go-utils/log"
)

// listen listens on the given port, or on a free one when it is empty.
func listen(host, port string) (net.Listener, int, error) {
	if port == "" {
		port = "0"
	}
	listener, err := net.Listen("tcp", net.JoinHostPort(host, port))
	if err != nil {
		return nil, 0, err
	}
	addr, ok := listener.Addr().(*net.TCPAddr)
	if !ok {
		if err := listener.Close(); err != nil {
			log.Errorf("Failed to close port, error: %s", err)
		}
		return nil, 0, fmt.Errorf("listener did not return *net.TCPAddr")
	}
	return listener, addr.Port, nil
}

func newAPIToken() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

// LaunchServer ...
func LaunchServer() error {
	// The /api routes require the token whatever the bind host is.
	bindHost := utility.EnvString("BIND_HOST", "127.0.0.1")
	listener, port, err := listen(bindHost, utility.EnvString("PORT", ""))
	if err != nil {
		return fmt.Errorf("Failed to listen, error: %s", err)
	}

	token, err := newAPIToken()
	if err != nil {
		return fmt.Errorf("Failed to generate API token, error: %s", err)
	}

	log.Printf("Starting API server on %s", listener.Addr())

	isServeFilesThroughMiddlemanServer := (utility.EnvString("USE_DEV_SERVER", "false") == "true")
	if isServeFilesThroughMiddlemanServer {
		log.Printf(" (!) Serving non api resources through middleman server!")
	}

	config.BitriseYMLPath = utility.EnvString("BITRISE_CONFIG", "bitrise.yml")
	config.SecretsYMLPath = utility.EnvString("BITRISE_SECRETS", ".bitrise.secrets.yml")

	if _, err := SetupRoutes(isServeFilesThroughMiddlemanServer, requireLocalCaller(token, port)); err != nil {
		return fmt.Errorf("Failed to setup routes, error: %s", err)
	}

	{
		openCmd := "open"
		if runtime.GOOS == "linux" {
			openCmd = "xdg-open"
		}
		workflowEditorURL := fmt.Sprintf("http://127.0.0.1:%d/%s/?token=%s", port, version.VERSION, token)
		log.Printf("Workflow editor URL: %s", workflowEditorURL)
		if err := command.NewWithStandardOuts(openCmd, workflowEditorURL).Run(); err != nil {
			log.Printf(" [!] Failed to open workflow editor in browser, error: %s", err)
		}
	}

	if err := http.Serve(listener, nil); err != nil {
		return fmt.Errorf("Can't start HTTP listener: %v", err)
	}
	return nil
}
