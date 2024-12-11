import { useCallback, useEffect, useState } from 'react';
import { Box, Label, Select } from '@bitrise/bitkit';
import { editor, languages } from 'monaco-editor';
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
  const [language, setLanguage] = useState('shell');
  const [monacoInstance, setMonaco] = useState<Monaco>();
  const [editorInstance, setEditor] = useState<editor.IStandaloneCodeEditor>();

  useEnvVarsAndSecretsCompletionProvider({ monaco: monacoInstance, language });

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

  useEffect(() => {
    if (!monacoInstance || !editorInstance) {
      return;
    }

    const model = editorInstance?.getModel();
    if (!model) {
      return;
    }

    monacoInstance.editor.setModelLanguage(model, language);
  }, [monacoInstance, editorInstance, language]);

  return (
    <Box display="flex" flexDir="column" gap="8px">
      {label && <Label>{label}</Label>}
      <Editor
        height="initial"
        theme="vs-dark"
        defaultValue={value}
        options={EDITOR_OPTIONS}
        defaultLanguage={language}
        onChange={(changedValue) => onChange(changedValue ?? null)}
        onMount={(edtr, mnco) => {
          setMonaco(mnco);
          setEditor(edtr);
        }}
      />
      <Select size="md" label="Language" value={language} onChange={(event) => setLanguage(event.target.value)}>
        {languages.getLanguages().map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.id}
          </option>
        ))}
      </Select>
    </Box>
  );
};

export default StepCodeEditor;
