import { useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import useMonacoYaml from '@/hooks/useMonacoYaml';

const EDITOR_OPTIONS = {
  roundedSelection: false,
  scrollBeyondLastLine: false,
  stickyScroll: {
    enabled: true,
  },
};

type YmlEditorProps = {
  ciConfigYml: string;
  isLoading?: boolean;
  readOnly: boolean;
  onEditorChange: (changedText?: string) => void;
};

const YmlEditor = (props: YmlEditorProps) => {
  const { ciConfigYml, isLoading, readOnly, onEditorChange } = props;

  const [monacoInstance, setMonaco] = useState<Monaco>();

  useMonacoYaml(monacoInstance);
  // useEnvVarsAndSecretsCompletionProvider({
  //   monaco: monacoInstance,
  //   language: 'yaml',
  // });

  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      onChange={onEditorChange}
      value={isLoading ? 'Loading...' : ciConfigYml}
      options={{ ...EDITOR_OPTIONS, readOnly: readOnly || isLoading }}
      beforeMount={setMonaco}
    />
  );
};

export default YmlEditor;
