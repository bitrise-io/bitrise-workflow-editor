package cli

import (
	"fmt"
	"os"
	"path"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver"
	"github.com/bitrise-io/bitrise-workflow-editor/version"
	"github.com/bitrise-io/go-utils/log"
	"github.com/urfave/cli"
)

// Run ...
func Run() {
	cli.VersionPrinter = func(c *cli.Context) {
		fmt.Fprintf(c.App.Writer, "%v\n", c.App.Version)
	}

	cli.HelpFlag = cli.BoolFlag{
		Name:  "help, h",
		Usage: "Show help",
	}

	cli.VersionFlag = cli.BoolFlag{
		Name:  "version, v",
		Usage: "Print the version",
	}

	app := cli.NewApp()
	app.Name = path.Base(os.Args[0])
	app.Usage = "Bitrise Workflow Editor"
	app.Version = version.VERSION

	app.Author = ""
	app.Email = ""

	app.Action = func(c *cli.Context) error {
		if err := apiserver.LaunchServer(); err != nil {
			log.Errorf("API Server failed, error: %s", err)
			os.Exit(1)
		}
		return nil
	}

	app.Commands = []cli.Command{
		versionCmd,
	}

	if err := app.Run(os.Args); err != nil {
		log.Errorf(err.Error())
		os.Exit(1)
	}
}
