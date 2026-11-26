package service

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/stretchr/testify/require"
)

// configmerge resolves local include paths relative to the process working directory (the CLI
// runs from the repo root), so tests chdir into the fixture dir.
func withWorkdir(t *testing.T, dir string) {
	t.Helper()
	prev, err := os.Getwd()
	require.NoError(t, err)
	require.NoError(t, os.Chdir(dir))
	t.Cleanup(func() { require.NoError(t, os.Chdir(prev)) })
}

func TestParseNodeKey(t *testing.T) {
	t.Run("local same-branch is editable, no ref", func(t *testing.T) {
		path, src, editable := parseNodeKey("modules/wf.yml")
		require.Equal(t, "modules/wf.yml", path)
		require.True(t, editable)
		require.Equal(t, "modules/wf.yml", src.Path)
		require.Nil(t, src.Repository)
		require.Nil(t, src.Branch)
	})

	t.Run("cross-repo branch is read-only", func(t *testing.T) {
		path, src, editable := parseNodeKey("repo:shared-modules,shared/build.yml@branch:main")
		require.Equal(t, "shared/build.yml", path)
		require.False(t, editable)
		require.Equal(t, "shared-modules", *src.Repository)
		require.Equal(t, "main", *src.Branch)
	})

	t.Run("pinned tag is read-only", func(t *testing.T) {
		path, src, editable := parseNodeKey("pinned/release.yml@tag:v1.4.0")
		require.Equal(t, "pinned/release.yml", path)
		require.False(t, editable)
		require.Equal(t, "v1.4.0", *src.Tag)
		require.Nil(t, src.Repository)
	})
}

func TestGetBitriseYMLTreeHandler_nonModular(t *testing.T) {
	dir := t.TempDir()
	withWorkdir(t, dir)
	contents := "format_version: \"13\"\nworkflows:\n  build: {}\n"
	require.NoError(t, fileutil.WriteStringToFile(filepath.Join(dir, "bitrise.yml"), contents))
	config.BitriseYMLPath = "bitrise.yml"

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/bitrise-yml/tree", nil)
	http.HandlerFunc(GetBitriseYMLTreeHandler).ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	var resp getConfigTreeResponse
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &resp))
	require.Equal(t, "bitrise.yml", resp.Root.Path)
	require.True(t, resp.Root.Editable)
	require.Nil(t, resp.Root.Source)
	require.Empty(t, resp.Root.Includes)
	require.Equal(t, contents, resp.MergedYML)
}

func TestGetBitriseYMLTreeHandler_modular(t *testing.T) {
	dir := t.TempDir()
	withWorkdir(t, dir)
	require.NoError(t, fileutil.WriteStringToFile(
		filepath.Join(dir, "bitrise.yml"),
		"format_version: \"13\"\ninclude:\n  - path: modules/wf.yml\npipelines:\n  release:\n    workflows:\n      build: {}\n",
	))
	require.NoError(t, os.MkdirAll(filepath.Join(dir, "modules"), 0o755))
	require.NoError(t, fileutil.WriteStringToFile(
		filepath.Join(dir, "modules", "wf.yml"),
		"workflows:\n  build: {}\n",
	))
	config.BitriseYMLPath = "bitrise.yml"

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/bitrise-yml/tree", nil)
	http.HandlerFunc(GetBitriseYMLTreeHandler).ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	var resp getConfigTreeResponse
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &resp))

	require.Equal(t, "bitrise.yml", resp.Root.Path)
	require.Nil(t, resp.Root.Source)
	require.Len(t, resp.Root.Includes, 1)

	child := resp.Root.Includes[0]
	require.Equal(t, "modules/wf.yml", child.Path)
	require.True(t, child.Editable)
	require.Equal(t, "modules/wf.yml", child.Source.Path)
	require.NotEqual(t, resp.Root.NodeID, child.NodeID)

	// Merged config stitches both files together.
	require.Contains(t, resp.MergedYML, "build")
	require.Contains(t, resp.MergedYML, "release")
}

const moduleYML = "workflows:\n  build: {}\n"

func rootIncluding(path string) string {
	return "format_version: \"13\"\ninclude:\n  - path: " + path + "\n"
}

func writeFiles(t *testing.T, dir string, files map[string]string) {
	t.Helper()
	for path, contents := range files {
		require.NoError(t, os.MkdirAll(filepath.Dir(filepath.Join(dir, path)), 0o755))
		require.NoError(t, fileutil.WriteStringToFile(filepath.Join(dir, path), contents))
	}
}

func modifiedInclude(path, contents string) wireTreeNode {
	return wireTreeNode{Path: path, Contents: contents, Editable: true, Modified: true, Includes: []wireTreeNode{}}
}

func postTree(t *testing.T, root wireTreeNode) *httptest.ResponseRecorder {
	t.Helper()
	body, err := json.Marshal(map[string]any{"root": root})
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/bitrise-yml/tree", bytes.NewReader(body))
	http.HandlerFunc(PostBitriseYMLTreeHandler).ServeHTTP(rr, req)
	return rr
}

func TestPostBitriseYMLTreeHandler_writesEditableModified(t *testing.T) {
	dir := t.TempDir()
	withWorkdir(t, dir)
	writeFiles(t, dir, map[string]string{"bitrise.yml": rootIncluding("modules/wf.yml"), "modules/wf.yml": moduleYML})
	config.BitriseYMLPath = "bitrise.yml"

	rr := postTree(t, wireTreeNode{
		Path:     "bitrise.yml",
		Contents: rootIncluding("modules/wf.yml"),
		Editable: true,
		Includes: []wireTreeNode{modifiedInclude("modules/wf.yml", moduleYML+"  deploy: {}\n")},
	})

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	written, err := fileutil.ReadStringFromFile(filepath.Join(dir, "modules", "wf.yml"))
	require.NoError(t, err)
	require.Contains(t, written, "deploy")
}

func TestPostBitriseYMLTreeHandler_configInSubdirWritesIncludesRelativeToWorkdir(t *testing.T) {
	dir := t.TempDir()
	withWorkdir(t, dir)
	writeFiles(t, dir, map[string]string{"ci/bitrise.yml": rootIncluding("ci/modules/wf.yml"), "ci/modules/wf.yml": moduleYML})
	config.BitriseYMLPath = "ci/bitrise.yml"

	rr := postTree(t, wireTreeNode{
		Path:     "bitrise.yml",
		Contents: rootIncluding("ci/modules/wf.yml") + "pipelines:\n  release:\n    workflows:\n      build: {}\n",
		Editable: true,
		Modified: true,
		Includes: []wireTreeNode{modifiedInclude("ci/modules/wf.yml", moduleYML+"  deploy: {}\n")},
	})

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	root, err := fileutil.ReadStringFromFile(filepath.Join(dir, "ci", "bitrise.yml"))
	require.NoError(t, err)
	require.Contains(t, root, "release")
	module, err := fileutil.ReadStringFromFile(filepath.Join(dir, "ci", "modules", "wf.yml"))
	require.NoError(t, err)
	require.Contains(t, module, "deploy")
	require.NoDirExists(t, filepath.Join(dir, "ci", "ci"))
}

func TestPostBitriseYMLTreeHandler_rootOnlySaveDoesNotNeedTheIncludesOnDisk(t *testing.T) {
	dir := t.TempDir()
	withWorkdir(t, dir)
	writeFiles(t, dir, map[string]string{"bitrise.yml": rootIncluding("modules/wf.yml")})
	config.BitriseYMLPath = "bitrise.yml"

	rr := postTree(t, wireTreeNode{
		Path:     "bitrise.yml",
		Contents: "format_version: \"13\"\nworkflows:\n  build: {}\n",
		Editable: true,
		Modified: true,
		Includes: []wireTreeNode{},
	})

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	root, err := fileutil.ReadStringFromFile(filepath.Join(dir, "bitrise.yml"))
	require.NoError(t, err)
	require.NotContains(t, root, "include")
}

func TestPostBitriseYMLTreeHandler_refusesPathsOutsideTheResolvedTree(t *testing.T) {
	parent := t.TempDir()
	dir := filepath.Join(parent, "repo")
	writeFiles(t, dir, map[string]string{"bitrise.yml": rootIncluding("modules/wf.yml"), "modules/wf.yml": moduleYML, "package.json": "{}"})
	withWorkdir(t, dir)
	config.BitriseYMLPath = "bitrise.yml"

	for name, postedPath := range map[string]string{
		"absolute path":             filepath.Join(parent, "pwned.yml"),
		"relative path escape":      "../pwned.yml",
		"repo file not in the tree": "package.json",
	} {
		t.Run(name, func(t *testing.T) {
			rr := postTree(t, wireTreeNode{
				Path:     "bitrise.yml",
				Contents: rootIncluding("modules/wf.yml"),
				Editable: true,
				Includes: []wireTreeNode{modifiedInclude(postedPath, moduleYML)},
			})

			require.Equal(t, http.StatusBadRequest, rr.Code, rr.Body.String())
			require.NoFileExists(t, filepath.Join(parent, "pwned.yml"))
			packageJSON, err := fileutil.ReadStringFromFile(filepath.Join(dir, "package.json"))
			require.NoError(t, err)
			require.Equal(t, "{}", packageJSON)
		})
	}
}

func TestPostBitriseYMLTreeHandler_refusesIncludesThatEscapeTheWorkdir(t *testing.T) {
	for name, tc := range map[string]struct {
		include string
		symlink bool
	}{
		"relative path": {include: "../outside.yml"},
		"symlink":       {include: "modules/wf.yml", symlink: true},
	} {
		t.Run(name, func(t *testing.T) {
			parent := t.TempDir()
			dir := filepath.Join(parent, "repo")
			writeFiles(t, parent, map[string]string{"repo/bitrise.yml": rootIncluding(tc.include), "outside.yml": "workflows:\n  original: {}\n"})
			if tc.symlink {
				require.NoError(t, os.MkdirAll(filepath.Join(dir, "modules"), 0o755))
				require.NoError(t, os.Symlink(filepath.Join(parent, "outside.yml"), filepath.Join(dir, tc.include)))
			}
			withWorkdir(t, dir)
			config.BitriseYMLPath = "bitrise.yml"

			rr := postTree(t, wireTreeNode{
				Path:     "bitrise.yml",
				Contents: rootIncluding(tc.include),
				Editable: true,
				Includes: []wireTreeNode{modifiedInclude(tc.include, moduleYML)},
			})

			require.Equal(t, http.StatusBadRequest, rr.Code, rr.Body.String())
			outside, err := fileutil.ReadStringFromFile(filepath.Join(parent, "outside.yml"))
			require.NoError(t, err)
			require.Contains(t, outside, "original")
		})
	}
}

func TestPostBitriseYMLTreeMergeHandler(t *testing.T) {
	payload := map[string]any{
		"root": wireTreeNode{
			Path:     "bitrise.yml",
			Contents: "format_version: \"13\"\ninclude:\n  - path: modules/wf.yml\npipelines:\n  release: {}\n",
			Includes: []wireTreeNode{{
				Path:     "modules/wf.yml",
				Contents: "workflows:\n  build: {}\n",
				Includes: []wireTreeNode{},
			}},
		},
	}
	body, err := json.Marshal(payload)
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/bitrise-yml/tree/merge", bytes.NewReader(body))
	http.HandlerFunc(PostBitriseYMLTreeMergeHandler).ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	var resp map[string]string
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &resp))
	require.Contains(t, resp["merged_yml"], "build")
	require.Contains(t, resp["merged_yml"], "release")
}
