package main

import (
	"log"
	"os"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver"
)

func main() {
	if err := apiserver.LaunchServer(); err != nil {
		log.Printf(" [!] API Server failed, error: %s", err)
		os.Exit(1)
	}
}
