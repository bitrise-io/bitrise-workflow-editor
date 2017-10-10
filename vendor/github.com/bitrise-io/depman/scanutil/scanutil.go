package scanutil

import (
	"fmt"
	"os"
	"path/filepath"
)

func ScanForFiles(scanRoot string, scanForRegex ...string) ([]string, error) {
	foundPaths := []string{}
	err := filepath.Walk(scanRoot, func(aPath string, aFileInfo os.FileInfo, err error) error {
		if err != nil {
			fmt.Println(err) // can't walk here,
			return nil       // but continue walking elsewhere
		}

		for _, aScanForRegex := range scanForRegex {
			matched, err := filepath.Match(aScanForRegex, aFileInfo.Name())
			if err != nil {
				fmt.Println(err) // malformed pattern
				return err       // this is fatal.
			}
			if matched {
				foundPaths = append(foundPaths, aPath)
			}
		}

		return nil
	})

	if err != nil {
		return []string{}, err
	}

	return foundPaths, nil
}
