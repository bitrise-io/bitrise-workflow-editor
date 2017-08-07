package cmd

import (
	"os"
	"path/filepath"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver"
	"github.com/bitrise-io/go-utils/log"
	"github.com/bitrise-io/go-utils/pathutil"
	"github.com/spf13/cobra"
)

func failf(format string, v ...interface{}) {
	log.Errorf(format, v...)
	os.Exit(1)
}

// RootCmd ...
var RootCmd = &cobra.Command{
	Use: "workflow-editor",
	Run: func(cmd *cobra.Command, args []string) {
		currentDir, err := filepath.Abs("./")
		if err != nil {
			failf("Failed to get current dir, error: %s", err)
		}

		bitriseConfigPth := filepath.Join(currentDir, "bitrise.yml")
		log.Printf("Searching for bitrise.yml at %s", bitriseConfigPth)

		if exist, err := pathutil.IsPathExists(bitriseConfigPth); err != nil {
			failf("Failed to check is bitrise.yml exist, error: %s", err)
		} else if !exist {
			failf("No bitrise config (bitrise.yml) found in the current directory")
		}

		if err := apiserver.LaunchServer(); err != nil {
			failf("Failed to start server, error: %s", err)
		}
	},
}
