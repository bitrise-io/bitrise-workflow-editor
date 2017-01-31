package main

import (
	"os"

	"github.com/bitrise-io/bitrise-workflow-editor/cmd"
	"github.com/bitrise-io/go-utils/log"
)

func main() {
	if err := cmd.RootCmd.Execute(); err != nil {
		log.Errorf(err.Error())
		os.Exit(1)
	}
}
