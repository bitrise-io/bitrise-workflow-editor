package depman

import (
	"fmt"
)

const (
	deplistPath = "./deplist.json"
)

// ReadDepListFile ...
func ReadDepListFile() (DepList, error) {
	deplist, err := ReadDepListFromFile(deplistPath)
	if err != nil {
		return DepList{}, fmt.Errorf("Failed to load deplist: %s", err)
	}
	return deplist, nil
}
