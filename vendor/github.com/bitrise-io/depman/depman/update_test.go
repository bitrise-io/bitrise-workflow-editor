package depman

import (
	"strings"
	"testing"
)

func createTestDepList() DepList {
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
		panic("Could not create the test DepList")
	}
	return testDepList
}

func Test_updateDependency(t *testing.T) {
	t.Log("updateDependency")

	if _, err := updateDependency(DepStruct{URL: "an-url", StorePath: "/an/absolute/path"}); err == nil {
		t.Error("Should not accept absolute StorePath")
	}
}

func TestPerformUpdateOnDepList(t *testing.T) {
	t.Log("PerformUpdateOn empty DepList")

	if _, err := PerformUpdateOnDepList(DepList{}); err != nil {
		t.Error(err)
	}
}
