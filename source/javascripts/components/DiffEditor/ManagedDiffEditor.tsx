import { DiffEditor, DiffEditorProps, MonacoDiffEditor } from '@monaco-editor/react';
import { useLayoutEffect, useRef } from 'react';

/**
 * `<DiffEditor>` with the model pair disposed in an order Monaco accepts.
 *
 * The library's own cleanup ends the two models before the widget still holding them
 * (`i.original.dispose(); i.modified.dispose(); u.current.dispose()`), which trips the
 * `TextModel got disposed before DiffEditorWidget model got reset` guard in `diffEditorWidget.js`
 * on every unmount. `keepCurrent*Model` takes the models off the library — the props only skip
 * disposal, they never reuse anything without a `path` (see CLAUDE.md) — and this ends them here
 * instead, `setModel(null)` first so the widget releases them before they die.
 *
 * A layout-effect cleanup is what makes that ordering hold: React runs those in the mutation
 * phase, ahead of every passive cleanup in the deleted subtree, so the widget is still alive when
 * this runs and the library's `useEffect` cleanup disposes it afterwards.
 */
const ManagedDiffEditor = ({ onMount, ...props }: DiffEditorProps) => {
  const editorRef = useRef<MonacoDiffEditor | null>(null);

  useLayoutEffect(
    () => () => {
      const editor = editorRef.current;
      const models = editor?.getModel();

      editor?.setModel(null);
      models?.original.dispose();
      models?.modified.dispose();
    },
    [],
  );

  return (
    <DiffEditor
      {...props}
      keepCurrentOriginalModel
      keepCurrentModifiedModel
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        onMount?.(editor, monaco);
      }}
    />
  );
};

export default ManagedDiffEditor;
