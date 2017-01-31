package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"runtime"

	ver "github.com/bitrise-io/bitrise-workflow-editor/version"
	flog "github.com/bitrise-io/go-utils/log"
	"github.com/spf13/cobra"
)

var fullVersion bool
var format string

// VersionOutputModel ...
type VersionOutputModel struct {
	Version     string `json:"version,omitempty"`
	OS          string `json:"os,omitempty"`
	GO          string `json:"go,omitempty"`
	BuildNumber string `json:"build_number,omitempty"`
	Commit      string `json:"commit,omitempty"`

	FullVersion bool `json:"-"`
}

// String ...
func (version VersionOutputModel) String() string {
	str := ""
	if version.FullVersion {
		str += fmt.Sprintf("version: %s\n", version.Version)
		str += fmt.Sprintf("os: %s\n", version.OS)
		str += fmt.Sprintf("go: %s\n", version.GO)
		str += fmt.Sprintf("build_number: %s\n", version.BuildNumber)
		str += fmt.Sprintf("commit: %s", version.Commit)
	} else {
		str = version.Version
	}

	return str
}

// JSON ...
func (version VersionOutputModel) JSON() string {
	if version.FullVersion {
		bytes, err := json.Marshal(version)
		if err != nil {
			return fmt.Sprintf(`"Failed to marshal version (%#v), err: %s"`, version, err)
		}
		return string(bytes) + "\n"
	}

	return fmt.Sprintf(`"%s"`+"\n", version.Version)
}

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Prints version info",
	Run: func(cmd *cobra.Command, args []string) {
		var log flog.Logger
		if format == "raw" {
			log = flog.NewDefaultRawLogger()
		} else if format == "json" {
			log = flog.NewDefaultJSONLoger()
		} else {
			flog.Errorf("Invalid format: %s\n", format)
			os.Exit(1)
		}

		versionOutput := VersionOutputModel{}
		versionOutput.Version = ver.VERSION
		versionOutput.OS = fmt.Sprintf("%s (%s)", runtime.GOOS, runtime.GOARCH)
		versionOutput.GO = runtime.Version()
		versionOutput.BuildNumber = ver.BuildNumber
		versionOutput.Commit = ver.Commit
		versionOutput.FullVersion = fullVersion

		log.Print(versionOutput)
	},
}

func init() {
	RootCmd.AddCommand(versionCmd)
	versionCmd.Flags().StringVarP(&format, "format", "", "raw", "Output format. Accepted: raw, json")
	versionCmd.Flags().BoolVarP(&fullVersion, "full", "", false, "Prints the build number and commit as well")
}
