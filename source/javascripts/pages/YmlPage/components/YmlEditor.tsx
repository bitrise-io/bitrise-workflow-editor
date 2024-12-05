import { useEffect, useState } from 'react';

import Editor from '@monaco-editor/react';
import { configureMonacoYaml, MonacoYaml } from 'monaco-yaml';

type YmlEditorProps = {
  ciConfigYml: string;
  isLoading?: boolean;
  readOnly: boolean;
  onEditorChange: (changedText?: string) => void;
};

const YmlEditor = (props: YmlEditorProps) => {
  const { ciConfigYml, isLoading, readOnly, onEditorChange } = props;
  const [monacoYaml, setMonacoYaml] = useState<MonacoYaml>();

  useEffect(() => {
    return monacoYaml?.dispose;
  }, [monacoYaml]);

  return (
    <Editor
      language="yaml"
      value={isLoading ? 'Loading...' : ciConfigYml}
      theme="vs-dark"
      options={{
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: readOnly || isLoading,
        stickyScroll: {
          enabled: true,
        },
      }}
      beforeMount={(monaco) => {
        setMonacoYaml(
          configureMonacoYaml(monaco, {
            hover: true,
            format: true,
            validate: true,
            completion: true,
            enableSchemaRequest: true,
            schemas: [{ uri: 'https://json.schemastore.org/bitrise.json', fileMatch: ['*'] }],
          }),
        );
      }}
      onChange={onEditorChange}
    />
  );
};

export default YmlEditor;
