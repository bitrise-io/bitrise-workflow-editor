import { useCallback, useEffect, useState } from 'react';
import { Box, Label } from '@bitrise/bitkit';
import { editor } from 'monaco-editor';
import { Editor, Monaco } from '@monaco-editor/react';
import { useEnvVarsAndSecretsCompletionProvider } from '@/hooks/useMonacoCompletionProvider';

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: 'mono',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  stickyScroll: { enabled: true },
};

type Props = {
  label?: string;
  value: string;
  onChange: (value: string | null) => void;
};

const StepCodeEditor = ({ label, value, onChange }: Props) => {
  const [monacoInstance, setMonaco] = useState<Monaco>();
  const [editorInstance, setEditor] = useState<editor.IStandaloneCodeEditor>();

  useEnvVarsAndSecretsCompletionProvider({
    monaco: monacoInstance,
    language: 'shell',
  });

  const updateEditorHeight = useCallback(() => {
    if (!editorInstance) {
      return;
    }

    const contentHeight = editorInstance?.getContentHeight() || 0;
    requestAnimationFrame(() =>
      editorInstance?.layout({
        height: contentHeight,
        width: editorInstance?.getLayoutInfo().width,
      }),
    );
  }, [editorInstance]);

  useEffect(() => {
    editorInstance?.onDidChangeModelContent(updateEditorHeight);
    updateEditorHeight();
  }, [editorInstance, updateEditorHeight]);

  return (
    <Box display="flex" flexDir="column" gap="8px">
      {label && <Label>{label}</Label>}
      <Editor
        height="initial"
        theme="vs-dark"
        defaultValue={value}
        options={EDITOR_OPTIONS}
        defaultLanguage="shell"
        onChange={(changedValue) => onChange(changedValue ?? null)}
        onMount={(edtr, mnco) => {
          setMonaco(mnco);
          setEditor(edtr);
        }}
      />
    </Box>
  );
};

export default StepCodeEditor;
