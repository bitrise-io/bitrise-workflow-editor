package pathutil

import (
	"testing"
)

func TestIsPathExists(t *testing.T) {
	t.Log("should return false if path doesn't exist")

	exists, err := IsPathExists("this/should/not/exist")
	if err != nil {
		t.Error("Unexpected error: ", err)
	}
	if exists {
		t.Error("Should NOT exist")
	}
}
