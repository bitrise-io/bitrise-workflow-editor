package main

import (
	"bufio"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"regexp"
	"strings"
)

func genericIsPathExists(pth string) (os.FileInfo, bool, error) {
	if pth == "" {
		return nil, false, errors.New("No path provided")
	}
	fileInf, err := os.Lstat(pth)
	if err == nil {
		return fileInf, true, nil
	}
	if os.IsNotExist(err) {
		return nil, false, nil
	}
	return fileInf, false, err
}

func isPathExists(pth string) (bool, error) {
	_, isExists, err := genericIsPathExists(pth)
	return isExists, err
}

func readBytesFromFile(pth string) ([]byte, error) {
	if isExists, err := isPathExists(pth); err != nil {
		return []byte{}, err
	} else if !isExists {
		return []byte{}, fmt.Errorf("No file found at path: %s", pth)
	}

	bytes, err := ioutil.ReadFile(pth)
	if err != nil {
		return []byte{}, err
	}
	return bytes, nil
}

func readStringFromFile(pth string) (string, error) {
	contBytes, err := readBytesFromFile(pth)
	if err != nil {
		return "", err
	}
	return string(contBytes), nil
}

func writeBytesToFileWithPermission(pth string, fileCont []byte, perm os.FileMode) error {
	if pth == "" {
		return errors.New("No path provided")
	}

	var file *os.File
	var err error
	if perm == 0 {
		file, err = os.Create(pth)
	} else {
		// same as os.Create, but with a specified permission
		//  the flags are copy-pasted from the official
		//  os.Create func: https://golang.org/src/os/file.go?s=7327:7366#L244
		file, err = os.OpenFile(pth, os.O_RDWR|os.O_CREATE|os.O_TRUNC, perm)
	}
	if err != nil {
		return err
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Println(" [!] Failed to close file:", err)
		}
	}()

	if _, err := file.Write(fileCont); err != nil {
		return err
	}

	return nil
}

func writeBytesToFile(pth string, fileCont []byte) error {
	return writeBytesToFileWithPermission(pth, fileCont, 0)
}

func writeStringToFile(pth string, fileCont string) error {
	return writeBytesToFile(pth, []byte(fileCont))
}

func failf(format string, v ...interface{}) {
	fmt.Printf(format, v...)
	os.Exit(1)
}

func bumpPluginVersion(version string, pluginDefinitionPath string) {
	if exist, err := isPathExists(pluginDefinitionPath); err != nil {
		failf("Failed to check if bitrise-plugin.yml file path (%s) exists, error: %s", pluginDefinitionPath, err)
	} else if !exist {
		failf("bitrise-plugin.yml file path not exist at: %s", pluginDefinitionPath)
	}

	pluginDefinition, err := readStringFromFile(pluginDefinitionPath)
	if err != nil {
		failf("Failed to read plugin definition, error: %s", err)
	}

	reader := strings.NewReader(pluginDefinition)
	scanner := bufio.NewScanner(reader)
	updatedLines := []string{}
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "  osx: ") || strings.HasPrefix(line, "  linux: ") {
			// osx: https://github.com/bitrise-io/bitrise-workflow-editor/releases/download/0.9.2/workflow-editor-Darwin-x86_64
			// linux: https://github.com/bitrise-io/bitrise-workflow-editor/releases/download/0.9.2/workflow-editor-Linux-x86_64

			pattern := `.+/(?P<version>[0-9]+.[0-9]+.[0-9]+)/.+`
			re := regexp.MustCompile(pattern)
			if match := re.FindStringSubmatch(line); len(match) == 2 {
				previousVersion := match[1]
				updatedLine := strings.Replace(line, previousVersion, version, -1)
				updatedLines = append(updatedLines, updatedLine)
			} else {
				failf("Failed to replace version")
			}
		} else {
			updatedLines = append(updatedLines, line)
		}
	}
	if err := scanner.Err(); err != nil {
		failf("Failed to scann plugin definition, error: %s", err)
	}

	updatedLines = append(updatedLines, "")
	updatedContent := strings.Join(updatedLines, "\n")
	if err := writeStringToFile(pluginDefinitionPath, updatedContent); err != nil {
		failf("Failed to update bitrise-plugin.yml, error: %s", err)
	}
}

func bumpBinaryVersion(version string, versionFilePath string) {
	if exist, err := isPathExists(versionFilePath); err != nil {
		failf("Failed to check if version.go file path (%s) exists, error: %s", versionFilePath, err)
	} else if !exist {
		failf("version.go file path not exist at: %s", versionFilePath)
	}

	versionContent := fmt.Sprintf(`package version

// VERSION ...
const VERSION = "%s"
	`, version)

	if err := writeStringToFile(versionFilePath, versionContent); err != nil {
		failf("Failed to update version.go file, error: %s", err)
	}
}

func main() {
	version := os.Getenv("BITRISE_WORKFLOW_EDITOR_VERSION")
	versionFilePath := os.Getenv("BITRISE_WORKFLOW_EDITOR_VERSION_FILE")
	pluginDefinitionPath := os.Getenv("BITRISE_WORKFLOW_EDITOR_PLUGIN_DEFINITION_FILE")

	if version == "" {
		failf("Missing BITRISE_WORKFLOW_EDITOR_VERSION environment\n")
	}

	if versionFilePath != "" {
		bumpBinaryVersion(version, versionFilePath)
	}

	if pluginDefinitionPath != "" {
		bumpPluginVersion(version, pluginDefinitionPath)
	}
}
