package cmd

import (
	"fmt"

	"github.com/bitrise-tools/depman/depman"
	"github.com/spf13/cobra"
)

// initCmd represents the init command
var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize the base config for depman",
	Long:  `Initialize the base config for depman`,
	RunE: func(cmd *cobra.Command, args []string) error {
		deplist := depman.DepList{
			Deps: []depman.DepStruct{
				depman.DepStruct{
					URL:       "http://repo.url",
					StorePath: "relative/store/path",
				},
			},
		}
		err := depman.WriteDepListToFile("./deplist.json", deplist)
		if err != nil {
			return err
		}
		fmt.Println("deplist.json file saved")
		return nil
	},
}

func init() {
	RootCmd.AddCommand(initCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// initCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// initCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")

}
