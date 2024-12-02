import { Editor } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';

type YmlEditorProps = {
  ciConfigYml: string;
  isLoading?: boolean;
  readOnly: boolean;
  onEditorChange: (changedText?: string) => void;
};
const YmlEditor = (props: YmlEditorProps) => {
  const { ciConfigYml, isLoading, readOnly, onEditorChange } = props;
  const defaultSchema = {
    uri: 'https://json.schemastore.org/bitrise.json',
    fileMatch: ['*'],
  };

  return (
    <Editor
      language="yaml"
      value={isLoading ? 'Loading...' : ciConfigYml}
      theme="vs-dark"
      options={{
        readOnly: readOnly || isLoading,
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
      onChange={onEditorChange}
    />
  );
};

export default YmlEditor;
