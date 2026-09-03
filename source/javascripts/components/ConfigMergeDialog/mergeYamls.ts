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
  // Deletion markers can only be finalised once the total output length is known — see below.
  const deletionMarkers: { index: number; gapLine: number }[] = [];

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

    // Decorations must be positioned by the running line count of the MERGED
    // OUTPUT, not by diff3's `bIndex`/`oIndex` — those are offsets into the
    // remote/base inputs and don't map onto the concatenated merged result, so
    // with more than one conflict region they land on the wrong line.
    const conflictStartLine = rows.length + 1; // 1-based line where conflict.b begins
    rows.push(...region.conflict.b);

    const remoteChangeIsADeletion = region.conflict.b.length === 0;

    if (remoteChangeIsADeletion) {
      // No output lines to outline, only the gap the removal left. Monaco draws an empty-range
      // block decoration at the TOP edge of `startLineNumber`, and the top of `conflictStartLine`
      // IS that gap. Anchoring a line earlier drew it a full line too high.
      deletionMarkers.push({ index: decorations.length, gapLine: conflictStartLine });
      decorations.push({
        options: { isWholeLine: false, blockClassName: 'conflict' },
        range: {
          startLineNumber: conflictStartLine,
          startColumn: 1,
          endLineNumber: conflictStartLine,
          endColumn: 1,
        },
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

  // A deletion with nothing after it leaves its gap BELOW the last line, so `gapLine` is one
  // past the end. Monaco would not drop that range, it would pull it back to the last line —
  // and since block decorations position from `startLineNumber` alone, the marker would then
  // render at that line's TOP edge, above the surviving text instead of after it.
  // `blockIsAfterEnd` is the documented opt-in for the bottom edge: an empty range on the last
  // line, rendered after it. Reachable only without a trailing newline; YAML usually has one.
  const lineCount = Math.max(rows.length, 1);
  deletionMarkers.forEach(({ index, gapLine }) => {
    if (gapLine <= lineCount) {
      return;
    }

    decorations[index] = {
      options: { isWholeLine: false, blockClassName: 'conflict', blockIsAfterEnd: true },
      range: { startLineNumber: lineCount, startColumn: 1, endLineNumber: lineCount, endColumn: 1 },
    };
  });

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
