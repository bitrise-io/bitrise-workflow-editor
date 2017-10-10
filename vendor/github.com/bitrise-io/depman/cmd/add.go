// Copyright © 2016 NAME HERE <EMAIL ADDRESS>
//

package cmd

import (
	"errors"

	log "github.com/Sirupsen/logrus"

	"github.com/spf13/cobra"
)

// addCmd represents the add command
var addCmd = &cobra.Command{
	Use:   "add GIT-CLONE-URL LOCAL-PATH",
	Short: "Add a new dependency",
	Long:  `Adds the dependency to your project's depman list`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if len(args) != 2 {
			return errors.New("'add' requires two parameters, the git clone url and the local path of the dependency")
		}
		gitCloneURL := args[0]
		localPath := args[1]
		log.Println("URL:", gitCloneURL)
		log.Println("Local path:", localPath)

		// deplist, err := ReadDepListFile()
		// if err != nil {
		// 	return fmt.Errorf("Failed to read deplist from file: %s", err)
		// }

		return nil
	},
}

func init() {
	RootCmd.AddCommand(addCmd)
}
