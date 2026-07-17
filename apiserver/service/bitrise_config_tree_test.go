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

func TestPostBitriseYMLTreeHandler_writesEditableModified(t *testing.T) {
	dir := t.TempDir()
	withWorkdir(t, dir)
	require.NoError(t, fileutil.WriteStringToFile(filepath.Join(dir, "bitrise.yml"), "format_version: \"13\"\ninclude:\n  - path: modules/wf.yml\n"))
	require.NoError(t, os.MkdirAll(filepath.Join(dir, "modules"), 0o755))
	require.NoError(t, fileutil.WriteStringToFile(filepath.Join(dir, "modules", "wf.yml"), "workflows:\n  build: {}\n"))
	config.BitriseYMLPath = "bitrise.yml"

	payload := map[string]any{
		"root": wireTreeNode{
			NodeID:   "n_root",
			Path:     "bitrise.yml",
			Contents: "format_version: \"13\"\ninclude:\n  - path: modules/wf.yml\n",
			Editable: true,
			Modified: false,
			Includes: []wireTreeNode{{
				NodeID:   "n_wf",
				Path:     "modules/wf.yml",
				Contents: "workflows:\n  build: {}\n  deploy: {}\n",
				Source:   &wireTreeNodeSource{Path: "modules/wf.yml"},
				Editable: true,
				Modified: true,
				Includes: []wireTreeNode{},
			}},
		},
	}
	body, err := json.Marshal(payload)
	require.NoError(t, err)

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/bitrise-yml/tree", bytes.NewReader(body))
	http.HandlerFunc(PostBitriseYMLTreeHandler).ServeHTTP(rr, req)

	require.Equal(t, http.StatusOK, rr.Code, rr.Body.String())
	written, err := fileutil.ReadStringFromFile(filepath.Join(dir, "modules", "wf.yml"))
	require.NoError(t, err)
	require.Contains(t, written, "deploy")
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
