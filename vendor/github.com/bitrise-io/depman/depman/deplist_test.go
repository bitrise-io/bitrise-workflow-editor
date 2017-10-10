package depman

import (
	"strings"
	"testing"
)

// TODO:
//  - validate input DepList: check if deps are valid (no url or store_path is missing)

func TestDepList(t *testing.T) {
	t.Log("Test DepList")

	_, err := ReadDepListFromReader(strings.NewReader(`{}`))
	if err != nil {
		t.Error("Empty test failed: ", err)
	}

	testDepListContent := `{
	"deps":[
		{
			"url": "test/url.url",
			"store_path": "a/relative/path"
		}
	]
}`
	testDepList, err := ReadDepListFromReader(strings.NewReader(testDepListContent))
	if err != nil {
		t.Error(err)
	}
	if len(testDepList.Deps) != 1 {
		t.Error("Failed to read 'Deps'")
	}
	testDepStruct := testDepList.Deps[0]
	if testDepStruct.URL != "test/url.url" {
		t.Error("Failed to read .URL")
	}
	if testDepStruct.StorePath != "a/relative/path" {
		t.Error("Failed to read .StorePath")
	}
}

func Test_generateFormattedJSONForDepList(t *testing.T) {
	t.Log("generateFormattedJSONForDepList")

	deplist := DepList{
		Deps: []DepStruct{},
	}

	jsonBytes, err := generateFormattedJSONForDepList(deplist)
	if err != nil {
		t.Error("returned error: ", err)
	}
	expectedContent := `{
	"deps": []
}`
	jsonString := string(jsonBytes)
	if jsonString != expectedContent {
		t.Log("Expected: ", expectedContent)
		t.Log("Given: ", jsonString)
		t.Error("Generated JSON doesn't match")
	}
}

func Test_generateFormattedJSONForDepLocks(t *testing.T) {
	t.Log("generateFormattedJSONForDepLocks")

	deplocks := []DepLockStruct{
		DepLockStruct{
			URL:      "url/1.url",
			Revision: "rev1",
		},
		DepLockStruct{
			URL:      "url/2.url",
			Revision: "rev2",
		},
	}

	jsonBytes, err := generateFormattedJSONForDepLocks(deplocks)
	if err != nil {
		t.Error("returned error: ", err)
	}
	expectedContent := `{
	"dep_locks": [
		{
			"url": "url/1.url",
			"revision": "rev1"
		},
		{
			"url": "url/2.url",
			"revision": "rev2"
		}
	]
}`
	jsonString := string(jsonBytes)
	if jsonString != expectedContent {
		t.Log("Expected: ", expectedContent)
		t.Log("Given: ", jsonString)
		t.Error("Generated JSON doesn't match")
	}
}
