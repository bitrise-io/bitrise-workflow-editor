package depman

import (
	"errors"
	"fmt"
	"github.com/bitrise-tools/depman/pathutil"
	"github.com/bitrise-tools/depman/scanutil"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

func runCommand(name string, args ...string) error {
	// fmt.Println("$ ", name, args)
	cmd := exec.Command(name, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func runCommandInDirAndGetOutput(workingDir, commandName string, args ...string) ([]byte, error) {
	// fmt.Println("$ ", commandName, args)
	cmd := exec.Command(commandName, args...)
	cmd.Dir = workingDir
	outputBytes, err := cmd.Output()
	if err != nil {
		return []byte{}, err
	}
	return outputBytes, nil
}

func updateDependency(dep DepStruct) (DepLockStruct, error) {
	if dep.URL == "" {
		return DepLockStruct{}, errors.New(fmt.Sprintf("Missing URL in dependency: %v", dep))
	}
	if dep.StorePath == "" {
		return DepLockStruct{}, errors.New(fmt.Sprintf("Missing StorePath in dependency: %v", dep))
	}

	cleanStorePath := filepath.Clean(dep.StorePath)

	absStorePath, err := filepath.Abs(cleanStorePath)
	if err != nil {
		return DepLockStruct{}, err
	}
	absStorePath = filepath.Clean(absStorePath)

	if absStorePath == cleanStorePath {
		return DepLockStruct{}, errors.New("Only relative paths allowed for StorePath!")
	}

	tempCloneDir, err := ioutil.TempDir("", "")
	if err != nil {
		return DepLockStruct{}, err
	}
	fmt.Println(" (i) absStorePath: ", absStorePath)
	fmt.Println(" (i) Temp dir: ", tempCloneDir)

	if err := runCommand("git", []string{"clone", "--recursive", dep.URL, tempCloneDir}...); err != nil {
		return DepLockStruct{}, err
	}

	// get revision hash
	outBytes, err := runCommandInDirAndGetOutput(tempCloneDir, "git", "log", "-1", `--format=%H`)
	if err != nil {
		return DepLockStruct{}, err
	}
	revisionHashString := string(outBytes)
	revisionHashString = strings.TrimSpace(revisionHashString)
	fmt.Println(" (i) Revision Hash: ", revisionHashString)

	// remove .git and .gitmodules folders
	dirsToRemove, err := scanutil.ScanForFiles(tempCloneDir, "*.git", "*.gitmodules")
	if err != nil {
		return DepLockStruct{}, err
	}
	for _, aDirToRemove := range dirsToRemove {
		log.Println(" (i) Removing folder: ", aDirToRemove)
		if err := runCommand("rm", "-rf", aDirToRemove); err != nil {
			log.Println(" [!] Failed to remove: ", aDirToRemove)
			return DepLockStruct{}, err
		}
	}

	// remove the current version
	isStorePathExists, err := pathutil.IsPathExists(absStorePath)
	if err != nil {
		return DepLockStruct{}, err
	}
	if isStorePathExists {
		log.Println("Removing current version...")
		if err := runCommand("rm", "-rf", absStorePath); err != nil {
			return DepLockStruct{}, err
		}
	}

	// copy
	err = os.MkdirAll(absStorePath, 0770)
	if err != nil {
		return DepLockStruct{}, err
	}

	err = runCommand("rsync", "-ah", tempCloneDir+"/", absStorePath+"/")
	if err != nil {
		return DepLockStruct{}, err
	}

	// cleanup
	if err := runCommand("rm", "-rf", tempCloneDir); err != nil {
		log.Println(" [!] Could not remove the temp clone directory: ", tempCloneDir)
		log.Println(err)
	}

	deplock := DepLockStruct{URL: dep.URL, Revision: revisionHashString}
	return deplock, nil
}

func PerformUpdateOnDepList(deplist DepList) ([]DepLockStruct, error) {
	deplocks := make([]DepLockStruct, len(deplist.Deps), len(deplist.Deps))
	for idx, aDep := range deplist.Deps {
		if aDepLock, err := updateDependency(aDep); err != nil {
			return []DepLockStruct{}, err
		} else {
			deplocks[idx] = aDepLock
		}
	}
	return deplocks, nil
}
