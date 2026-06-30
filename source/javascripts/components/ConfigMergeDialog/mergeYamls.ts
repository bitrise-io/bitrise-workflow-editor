import { DiffEditorProps } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { diff3Merge } from 'node-diff3';

/**
 * 3-way merge of a single YAML file: `yours` (local edits) and `remoteYaml` (the
 * branch HEAD) reconciled against their common `baseYaml`. Conflicting regions are
 * auto-resolved to the remote side and reported as decorations so the UI can mark
 * them red — the user edits the merged result to recover their own changes.
 *
 * Shared by the modular per-file conflict dialog. (The legacy single-file dialog
 * keeps its own copy until the modular-editing flag graduates and it is removed.)
 */
export function mergeYamls(yourYaml: string, baseYaml: string, remoteYaml: string) {
  const rows: string[] = [];
  const decorations: editor.IModelDeltaDecoration[] = [];

  diff3Merge<string>(yourYaml, baseYaml, remoteYaml, {
    stringSeparator: '\n',
  }).forEach((region) => {
    if (region.ok) {
      rows.push(...region.ok);
    } else if (region.conflict) {
      rows.push(...region.conflict.b);

      const remoteChangeIsADeletion = region.conflict.b.length === 0;

      if (remoteChangeIsADeletion) {
        decorations.push({
          options: {
            isWholeLine: false,
            blockClassName: 'conflict',
          },
          range: {
            startLineNumber: region.conflict.oIndex + 1,
            startColumn: 1,
            endLineNumber: region.conflict.oIndex + 1,
            endColumn: 1,
          },
        });
      }

      if (!remoteChangeIsADeletion) {
        decorations.push({
          options: {
            isWholeLine: true,
            blockClassName: 'conflict',
          },
          range: {
            startLineNumber: region.conflict.bIndex + 1,
            startColumn: 1,
            endLineNumber: region.conflict.bIndex + region.conflict.b.length,
            endColumn: 1,
          },
        });
      }
    }
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
