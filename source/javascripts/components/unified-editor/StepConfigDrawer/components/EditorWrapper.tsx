import { Editor } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useCallback, useEffect, useState } from 'react';

import MonacoUtils from '@/core/utils/MonacoUtils';

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: 'mono',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  stickyScroll: { enabled: true },
  contextmenu: false,
  minimap: { enabled: false },
  padding: { top: 16, bottom: 16 },
};

type EditorWrapperProps = {
  value: string;
  defaultValue?: string;
  onChange: (value: string | null) => void;
  readOnly?: boolean;
};

const EditorWrapper = (props: EditorWrapperProps) => {
  const { defaultValue, onChange, readOnly, value } = props;
  const [editorInstance, setEditor] = useState<editor.IStandaloneCodeEditor>();

  const updateEditorHeight = useCallback(() => {
    if (!editorInstance) {
      return;
    }

    const contentHeight = Math.min(editorInstance?.getContentHeight() || 250, window.innerHeight * 0.5);
    requestAnimationFrame(() =>
      editorInstance?.layout({
        height: contentHeight,
        width: editorInstance?.getLayoutInfo().width,
      }),
    );
  }, [editorInstance]);

  useEffect(() => {
    editorInstance?.onDidContentSizeChange(updateEditorHeight);
    updateEditorHeight();
    return undefined;
  }, [editorInstance, updateEditorHeight]);

  return (
    <Editor
      theme="vs-dark"
      onMount={setEditor}
      defaultLanguage="shell"
      options={{ ...EDITOR_OPTIONS, readOnly }}
      value={value || defaultValue}
      onChange={(changedValue) => onChange(changedValue || null)}
      beforeMount={MonacoUtils.configureEnvVarsCompletionProvider}
    />
  );
};
export default EditorWrapper;
