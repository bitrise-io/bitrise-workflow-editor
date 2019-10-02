package gems

import (
	"fmt"
	"os/exec"

	"github.com/bitrise-io/go-utils/command"
	"github.com/bitrise-io/go-utils/command/rubycommand"
)

// InstallBundlerCommand returns a command to install a specific bundler version
func InstallBundlerCommand(gemfileLockVersion Version) *command.Model {
	args := []string{"install", "bundler", "--force", "--no-document"}
	if gemfileLockVersion.Found {
		args = append(args, []string{"--version", gemfileLockVersion.Version}...)
	}

	return command.New("gem", args...)
}

// BundleInstallCommand returns a command to install a bundle using bundler
func BundleInstallCommand(gemfileLockVersion Version) (*command.Model, error) {
	var args []string
	if gemfileLockVersion.Found {
		args = append(args, "_"+gemfileLockVersion.Version+"_")
	}
	args = append(args, []string{"install", "--jobs", "20", "--retry", "5"}...)

	return rubycommand.New("bundle", args...)
}

// BundleExecPrefix returns a slice containing: "bundle [_verson_] exec"
func BundleExecPrefix(bundlerVersion Version) []string {
	bundleExec := []string{"bundle"}
	if bundlerVersion.Found {
		bundleExec = append(bundleExec, fmt.Sprintf("_%s_", bundlerVersion.Version))
	}
	return append(bundleExec, "exec")
}

// RbenvVersionsCommand retruns a command to print used and available ruby versions if rbenv is installed
func RbenvVersionsCommand() *command.Model {
	if _, err := exec.LookPath("rbenv"); err != nil {
		return nil
	}

	return command.New("rbenv", "versions")
}
