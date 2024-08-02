import Editor from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';

type YmlEditorProps = {
  isLoading?: boolean;
  readonly: boolean;
  yml: string;
  onChange: VoidFunction;
};
const YmlEditor = ({ isLoading, readonly, yml, onChange }: YmlEditorProps) => {
  const defaultSchema = {
    uri: 'https://json.schemastore.org/bitrise.json',
    fileMatch: ['*'],
  };

  return (
    <Editor
      language="yaml"
      value={isLoading ? 'Loading...' : yml}
      theme="vs-dark"
      options={{
        readOnly: readonly || isLoading,
        roundedSelection: false,
        scrollBeyondLastLine: false,
        stickyScroll: {
          enabled: true,
        },
      }}
      onMount={(_, monaco) => {
        configureMonacoYaml(monaco, {
          validate: true,
          enableSchemaRequest: true,
          format: true,
          hover: true,
          completion: true,
          schemas: [defaultSchema],
        });
      }}
      onChange={onChange}
    />
  );
};

export default YmlEditor;
