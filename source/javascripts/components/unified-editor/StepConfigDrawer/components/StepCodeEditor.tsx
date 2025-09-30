import { Box, Label } from '@bitrise/bitkit';
import { Editor } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
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

type Props = {
  label?: string;
  value: string;
  defaultValue?: string;
  onChange: (value: string | null) => void;
};

const StepCodeEditor = ({ label, value, defaultValue, onChange }: Props) => {
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
    <Box display="flex" flexDir="column" gap="8px">
      {label && <Label>{label}</Label>}
      <Editor
        theme="vs-dark"
        onMount={setEditor}
        defaultLanguage="shell"
        options={EDITOR_OPTIONS}
        value={value || defaultValue}
        onChange={(changedValue) => onChange(changedValue || null)}
        beforeMount={MonacoUtils.configureEnvVarsCompletionProvider}
      />
    </Box>
  );
};

export default StepCodeEditor;
