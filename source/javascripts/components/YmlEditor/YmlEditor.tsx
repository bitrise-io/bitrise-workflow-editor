import Editor from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';

type YmlEditorProps = {
  readonly: boolean;
  yml: string;
  onChange: VoidFunction;
};
const YmlEditor = ({ readonly, yml, onChange }: YmlEditorProps) => {
  const defaultSchema = {
    uri: 'https://json.schemastore.org/bitrise.json',
    fileMatch: ['*'],
  };

  return (
    <Editor
      defaultLanguage="yaml"
      defaultValue={yml}
      theme="vs-dark"
      options={{
        readOnly: readonly,
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
