package cmd

import (
	"fmt"
	"log"

	"github.com/bitrise-io/depman/depman"
	"github.com/spf13/cobra"
)

// updateCmd represents the update command
var updateCmd = &cobra.Command{
	Use:   "update",
	Short: "Update all dependencies",
	Long:  `Update all dependencies`,
	RunE: func(cmd *cobra.Command, args []string) error {
		deplist, err := depman.ReadDepListFile()
		if err != nil {
			return err
		}

		log.Printf("Updating %d dependencies...\n", len(deplist.Deps))
		deplocks, err := depman.PerformUpdateOnDepList(deplist)
		if err != nil {
			return fmt.Errorf("Update failed: %s", err)
		}
		// write DepLocks
		log.Println("Writing deplock...")
		if err := depman.WriteDepLocksToFile("./deplock.json", deplocks); err != nil {
			return fmt.Errorf("Failed to write deplock.json: %s", err)
		}
		log.Println("Update finished!")
		return nil
	},
}

func init() {
	RootCmd.AddCommand(updateCmd)
}
