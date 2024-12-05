import { useEffect, useState } from 'react';

import Editor from '@monaco-editor/react';
import { configureMonacoYaml, MonacoYaml } from 'monaco-yaml';

type YmlEditorProps = {
  isLoading?: boolean;
  readonly: boolean;
  yml: string;
  onChange: (changedText?: string) => void;
};

const YmlEditor = ({ isLoading, readonly, yml, onChange }: YmlEditorProps) => {
  const [monacoYaml, setMonacoYaml] = useState<MonacoYaml>();

  useEffect(() => {
    return monacoYaml?.dispose;
  }, [monacoYaml]);

  return (
    <Editor
      language="yaml"
      value={isLoading ? 'Loading...' : yml}
      theme="vs-dark"
      options={{
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: readonly || isLoading,
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
      onChange={onChange}
    />
  );
};

export default YmlEditor;
