import { DiffEditorProps } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { diff3Merge } from 'node-diff3';

/**
 * 3-way merge of a single YAML file: `yours` (local edits) and `remoteYaml` (the
 * branch HEAD) reconciled against their common `baseYaml`. Conflicting regions are
 * auto-resolved to the remote side and reported as decorations so the UI can mark
 * them red — the user edits the merged result to recover their own changes.
 *
 * Shared by both conflict dialogs — the modular per-file one and the legacy
 * single-file one, which is removed when the modular-editing flag graduates.
 */
export function mergeYamls(yourYaml: string, baseYaml: string, remoteYaml: string) {
  const rows: string[] = [];
  const decorations: editor.IModelDeltaDecoration[] = [];

  diff3Merge<string>(yourYaml, baseYaml, remoteYaml, {
    stringSeparator: '\n',
  }).forEach((region) => {
    if (region.ok) {
      rows.push(...region.ok);
      return;
    }

    if (!region.conflict) {
      return;
    }

    // Position by the running line count of the MERGED OUTPUT. diff3's `bIndex`/`oIndex`
    // are offsets into the remote/base inputs, so past the first conflict they drift.
    const conflictStartLine = rows.length + 1; // 1-based line where conflict.b begins
    rows.push(...region.conflict.b);

    const remoteChangeIsADeletion = region.conflict.b.length === 0;

    if (remoteChangeIsADeletion) {
      // No output lines to outline, only the gap the removal left. Monaco anchors an
      // empty-range block decoration at the TOP edge of `startLineNumber`, and the top of
      // `conflictStartLine` IS that gap — a line earlier draws it a full line too high.
      decorations.push({
        options: { isWholeLine: false, blockClassName: 'conflict' },
        range: { startLineNumber: conflictStartLine, startColumn: 1, endLineNumber: conflictStartLine, endColumn: 1 },
      });
    } else {
      decorations.push({
        options: { isWholeLine: true, blockClassName: 'conflict' },
        range: {
          startLineNumber: conflictStartLine,
          startColumn: 1,
          endLineNumber: conflictStartLine + region.conflict.b.length - 1,
          endColumn: 1,
        },
      });
    }
  });

  // Only a deletion with nothing after it can anchor past the last line. Monaco pulls that
  // range back and — block decorations positioning from `startLineNumber` alone — would draw
  // the marker above the surviving text; `blockIsAfterEnd` is its opt-in for the bottom edge.
  // Reachable only without a trailing newline, and — diff3 coalescing adjacent conflicts — in
  // practice that is the last decoration, so the last one is the only one worth re-checking.
  const lineCount = Math.max(rows.length, 1);
  const last = decorations[decorations.length - 1];

  if (last && last.range.startLineNumber > lineCount) {
    last.options = { ...last.options, blockIsAfterEnd: true };
    last.range = { startLineNumber: lineCount, startColumn: 1, endLineNumber: lineCount, endColumn: 1 };
  }

  return {
    decorations,
    mergedYml: rows.join('\n'),
  };
}

export const diffEditorOptions: DiffEditorProps['options'] = {
  diffWordWrap: 'off',
  automaticLayout: true,
  roundedSelection: false,
  renderSideBySide: false,
  renderGutterMenu: false,
  renderWhitespace: 'all',
  ignoreTrimWhitespace: false,
  padding: {
    top: 16,
    bottom: 16,
  },
  hideUnchangedRegions: {
    enabled: true,
  },
};

export const readOnlyDiffEditorOptions: DiffEditorProps['options'] = {
  ...diffEditorOptions,
  readOnly: true,
};
