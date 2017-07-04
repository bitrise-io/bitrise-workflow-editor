package cmd

import (
	"os"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver"
	"github.com/bitrise-io/go-utils/log"
	"github.com/spf13/cobra"
)

// RootCmd ...
var RootCmd = &cobra.Command{
	Use: "workflow-editor",
	Run: func(cmd *cobra.Command, args []string) {
		if err := apiserver.LaunchServer(); err != nil {
			log.Errorf("Failed to start server, error: %s", err)
			os.Exit(1)
		}
	},
}
