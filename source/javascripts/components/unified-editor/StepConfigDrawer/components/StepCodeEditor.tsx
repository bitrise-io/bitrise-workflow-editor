import { useCallback, useEffect, useState } from 'react';
import { Box, Label } from '@bitrise/bitkit';
import { Editor, Monaco } from '@monaco-editor/react';
import { useEnvVarsAndSecretsCompletionProvider } from '@/hooks/useMonacoCompletionProvider';
import monaco from '@/monaco';

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
  const [monacoInstance, setMonaco] = useState<Monaco>();
  const [editorInstance, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();

  useEnvVarsAndSecretsCompletionProvider({
    monaco: monacoInstance,
    language: 'shell',
  });

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
        value={value || defaultValue}
        options={EDITOR_OPTIONS}
        defaultLanguage="shell"
        onChange={(changedValue) => onChange(changedValue || null)}
        onMount={(edtr, mnco) => {
          setMonaco(mnco);
          setEditor(edtr);
        }}
      />
    </Box>
  );
};

export default StepCodeEditor;
