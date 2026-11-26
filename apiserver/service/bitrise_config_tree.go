package service

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/config"
	"github.com/bitrise-io/bitrise-workflow-editor/apiserver/utility"
	"github.com/bitrise-io/bitrise/v2/configmerge"
	bitriselog "github.com/bitrise-io/bitrise/v2/log"
	"github.com/bitrise-io/bitrise/v2/models"
	"github.com/bitrise-io/go-utils/fileutil"
	"github.com/bitrise-io/go-utils/log"
)

// The config tree wire shape mirrors what the Workflow Editor frontend expects from the
// hosted `/config/tree` endpoint (see BitriseYmlApi.ts `WireTreeNode`), so the same FE
// code drives cloud and local. The frontend builds the entity index itself from these
// files, so no index is sent here.

type wireTreeNodeSource struct {
	Path       string  `json:"path"`
	Repository *string `json:"repository"`
	Branch     *string `json:"branch"`
	Tag        *string `json:"tag"`
	Commit     *string `json:"commit"`
}

type wireTreeNode struct {
	NodeID    string              `json:"node_id"`
	Path      string              `json:"path"`
	Contents  string              `json:"contents"`
	Source    *wireTreeNodeSource `json:"source"`
	CommitSha string              `json:"commit_sha"`
	Editable  bool                `json:"editable"`
	Modified  bool                `json:"modified,omitempty"`
	Includes  []wireTreeNode      `json:"includes"`
}

type getConfigTreeResponse struct {
	Root      wireTreeNode `json:"root"`
	MergedYML string       `json:"merged_yml"`
	Branch    string       `json:"branch"`
}

func configMergeLogger() bitriselog.Logger {
	return bitriselog.NewLogger(bitriselog.LoggerOpts{LoggerType: bitriselog.ConsoleLogger, Writer: io.Discard})
}

// nodeID is a stable id derived from the node's merge key (unique within a tree — the key
// already encodes path + repo + ref), so the FE keeps tab/selection identity across reloads.
func nodeID(key string) string {
	sum := sha256.Sum256([]byte(key))
	return "n_" + hex.EncodeToString(sum[:])[:12]
}

func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// parseNodeKey splits a configmerge tree key back into its parts. Local same-branch keys are
// a bare path; cross-ref keys look like `repo:NAME,path@branch:B` / `…@tag:T` / `…@commit:C`.
// A node is editable only when it lives in the working repo on the current branch (no repo, no
// pinned ref) — matching the cloud read-only rule.
func parseNodeKey(key string) (path string, source wireTreeNodeSource, editable bool) {
	rest := key
	var repo string
	if strings.HasPrefix(rest, "repo:") {
		rest = strings.TrimPrefix(rest, "repo:")
		if comma := strings.Index(rest, ","); comma >= 0 {
			repo = rest[:comma]
			rest = rest[comma+1:]
		}
	}

	var branch, tag, commit string
	if i := strings.Index(rest, "@commit:"); i >= 0 {
		path, commit = rest[:i], rest[i+len("@commit:"):]
	} else if i := strings.Index(rest, "@tag:"); i >= 0 {
		path, tag = rest[:i], rest[i+len("@tag:"):]
	} else if i := strings.Index(rest, "@branch:"); i >= 0 {
		path, branch = rest[:i], rest[i+len("@branch:"):]
	} else {
		path = rest
	}

	editable = repo == "" && branch == "" && tag == "" && commit == ""
	source = wireTreeNodeSource{Path: path, Repository: strPtr(repo), Branch: strPtr(branch), Tag: strPtr(tag), Commit: strPtr(commit)}
	return path, source, editable
}

func toWireTreeNode(node models.ConfigFileTreeModel, rootPath string, isRoot bool) wireTreeNode {
	includes := make([]wireTreeNode, 0, len(node.Includes))
	for _, child := range node.Includes {
		includes = append(includes, toWireTreeNode(child, rootPath, false))
	}

	wire := wireTreeNode{
		NodeID:   nodeID(node.Path),
		Contents: node.Contents,
		Editable: true,
		Includes: includes,
	}

	if isRoot {
		// The root is loaded directly (not via an include), so it has no source; normalize its
		// path to the repo-relative bitrise.yml regardless of how the CLI addressed it.
		wire.Path = rootPath
		wire.Source = nil
	} else {
		path, source, editable := parseNodeKey(node.Path)
		wire.Path = path
		wire.Source = &source
		wire.Editable = editable
	}
	return wire
}

// resolveConfigTree reads the include tree from disk (via the bitrise CLI's configmerge) in the FE
// wire shape, plus the merged config. A non-modular config is a single root node, so callers
// consume one shape either way.
func resolveConfigTree() (getConfigTreeResponse, error) {
	rootPath := filepath.Base(config.BitriseYMLPath)

	isModular, err := configmerge.IsModularConfig(config.BitriseYMLPath)
	if err != nil {
		log.Errorf("Failed to detect modular config (%s), error: %s", config.BitriseYMLPath, err)
		return getConfigTreeResponse{}, fmt.Errorf("read bitrise.yml: %w", err)
	}

	if !isModular {
		contStr, err := fileutil.ReadStringFromFile(config.BitriseYMLPath)
		if err != nil {
			log.Errorf("Failed to read bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
			return getConfigTreeResponse{}, fmt.Errorf("read bitrise.yml: %w", err)
		}
		return getConfigTreeResponse{
			Root:      wireTreeNode{NodeID: nodeID(rootPath), Path: rootPath, Contents: contStr, Editable: true, Includes: []wireTreeNode{}},
			MergedYML: contStr,
		}, nil
	}

	reader, err := configmerge.NewConfigReader(configMergeLogger())
	if err != nil {
		log.Errorf("Failed to init config reader, error: %s", err)
		return getConfigTreeResponse{}, fmt.Errorf("resolve config tree: %w", err)
	}
	merger := configmerge.NewMerger(reader, configMergeLogger())

	mergedYML, tree, err := merger.MergeConfig(config.BitriseYMLPath)
	if err != nil {
		log.Errorf("Failed to merge modular config (%s), error: %s", config.BitriseYMLPath, err)
		return getConfigTreeResponse{}, fmt.Errorf("resolve config tree: %w", err)
	}

	return getConfigTreeResponse{
		Root:      toWireTreeNode(*tree, rootPath, true),
		MergedYML: mergedYML,
	}, nil
}

// GetBitriseYMLTreeHandler returns the include tree and the merged config as read from disk.
func GetBitriseYMLTreeHandler(w http.ResponseWriter, r *http.Request) {
	resp, err := resolveConfigTree()
	if err != nil {
		RespondWithJSONBadRequestErrorMessage(w, "Failed to %s", err)
		return
	}
	RespondWithJSON(w, http.StatusOK, resp)
}

func toConfigFileTree(node wireTreeNode) models.ConfigFileTreeModel {
	includes := make([]models.ConfigFileTreeModel, 0, len(node.Includes))
	for _, child := range node.Includes {
		includes = append(includes, toConfigFileTree(child))
	}
	return models.ConfigFileTreeModel{Path: node.Path, Contents: node.Contents, Includes: includes}
}

func collectIncludes(nodes []wireTreeNode, keep func(wireTreeNode) bool) []wireTreeNode {
	var out []wireTreeNode
	for _, node := range nodes {
		if keep(node) {
			out = append(out, node)
		}
		out = append(out, collectIncludes(node.Includes, keep)...)
	}
	return out
}

func isEditable(node wireTreeNode) bool { return node.Editable }

func isEditableModified(node wireTreeNode) bool { return node.Editable && node.Modified }

// PostBitriseYMLTreeHandler validates the merged tree, then writes each changed, editable module
// file back to disk. Read-only (cross-ref) files are never written; unmodified files are skipped.
//
// Include paths come from the tree on disk, not the request, and are written through an os.Root
// at the working directory, which configmerge resolves local includes against.
func PostBitriseYMLTreeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		RespondWithJSONBadRequestErrorMessage(w, "Empty request body")
		return
	}
	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Errorf("Failed to close request body, error: %s", err)
		}
	}()

	var reqObj struct {
		Root wireTreeNode `json:"root"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		log.Errorf("Failed to read JSON input, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	// Validation is merged-only (a single module isn't a complete config), mirroring cloud.
	tree := toConfigFileTree(reqObj.Root)
	mergedYML, err := tree.Merge()
	if err != nil {
		log.Errorf("Failed to merge config tree, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to merge config tree, error: %s", err)
		return
	}
	warnings, validationErr := utility.ValidateBitriseConfigAndSecret(mergedYML, config.MinimalValidSecrets)
	if validationErr != nil {
		log.Errorf("Validation error: %s", validationErr)
		RespondWithJSON(w, http.StatusBadRequest, NewErrorResponseWithConfig(mergedYML, "%s", validationErr.Error()))
		return
	}

	modifiedIncludes := collectIncludes(reqObj.Root.Includes, isEditableModified)
	writable := map[string]bool{}
	if len(modifiedIncludes) > 0 {
		onDisk, err := resolveConfigTree()
		if err != nil {
			RespondWithJSONBadRequestErrorMessage(w, "Failed to %s", err)
			return
		}
		for _, node := range collectIncludes(onDisk.Root.Includes, isEditable) {
			writable[node.Path] = true
		}
	}

	workdir, err := os.OpenRoot(".")
	if err != nil {
		log.Errorf("Failed to open the working directory, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to open the working directory, error: %s", err)
		return
	}
	defer func() {
		if err := workdir.Close(); err != nil {
			log.Errorf("Failed to close the working directory, error: %s", err)
		}
	}()

	for _, node := range modifiedIncludes {
		if !writable[node.Path] {
			log.Errorf("Refusing to write %s: not an editable file of the config on disk", node.Path)
			RespondWithJSONBadRequestErrorMessage(w, "Refusing to write %s: not an editable file of the config on disk", node.Path)
			return
		}
		if _, err := workdir.Stat(node.Path); err != nil {
			log.Errorf("Refusing to write %s, error: %s", node.Path, err)
			RespondWithJSONBadRequestErrorMessage(w, "Refusing to write %s, error: %s", node.Path, err)
			return
		}
	}

	if isEditableModified(reqObj.Root) {
		if err := fileutil.WriteStringToFile(config.BitriseYMLPath, reqObj.Root.Contents); err != nil {
			log.Errorf("Failed to write bitrise.yml (%s), error: %s", config.BitriseYMLPath, err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to write bitrise.yml, error: %s", err)
			return
		}
	}
	for _, node := range modifiedIncludes {
		if err := workdir.WriteFile(node.Path, []byte(node.Contents), 0o644); err != nil {
			log.Errorf("Failed to write module file (%s), error: %s", node.Path, err)
			RespondWithJSONBadRequestErrorMessage(w, "Failed to write module file (%s), error: %s", node.Path, err)
			return
		}
	}

	RespondWithJSON(w, http.StatusOK, utility.ValidationResponse{Warnings: warnings})
}

// PostBitriseYMLTreeMergeHandler flattens the posted (possibly-edited) tree so the merged-config
// view reflects in-memory edits without a reload.
func PostBitriseYMLTreeMergeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Body == nil {
		RespondWithJSONBadRequestErrorMessage(w, "Empty request body")
		return
	}
	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Errorf("Failed to close request body, error: %s", err)
		}
	}()

	var reqObj struct {
		Root wireTreeNode `json:"root"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqObj); err != nil {
		RespondWithJSONBadRequestErrorMessage(w, "Failed to read JSON input, error: %s", err)
		return
	}

	tree := toConfigFileTree(reqObj.Root)
	mergedYML, err := tree.Merge()
	if err != nil {
		log.Errorf("Failed to merge config tree, error: %s", err)
		RespondWithJSONBadRequestErrorMessage(w, "Failed to merge config tree, error: %s", err)
		return
	}

	RespondWithJSON(w, http.StatusOK, map[string]string{"merged_yml": mergedYML})
}
