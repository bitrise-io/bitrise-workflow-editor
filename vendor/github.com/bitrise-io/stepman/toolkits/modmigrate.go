package toolkits

import (
	"fmt"
	"os"
	"path/filepath"
)

func isGoPathModeStep(projectDir string) bool {
	goModPath := filepath.Join(projectDir, "go.mod")
	_, err := os.Stat(goModPath)

	return err != nil
}

func migrateToGoModules(stepAbsDirPath, packageName string) error {
	if packageName == "" {
		return fmt.Errorf("package name not specified")
	}

	// The go directive (https://golang.org/ref/mod#go-mod-file-go) sets go CLI and language features
	// Setting it to a fixed version so a future backward incompatible change does code
	goModTemplate := `module %s
go 1.16`
	goModContents := fmt.Sprintf(goModTemplate, packageName)
	if err := os.WriteFile(filepath.Join(stepAbsDirPath, "go.mod"), []byte(goModContents), 0600); err != nil {
		return fmt.Errorf("failed to write go.mod file: %v", err)
	}

	return nil
}
