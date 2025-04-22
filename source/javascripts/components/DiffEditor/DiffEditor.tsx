import { ProgressBitbot } from '@bitrise/bitkit';
import { DiffEditor, MonacoDiffEditor } from '@monaco-editor/react';

import MonacoUtils from '@/core/utils/MonacoUtils';

type Props = {
  originalText: string;
  modifiedText: string;
  onChange: (changedText: string) => void;
  language?: string;
};

const DiffEditorComponent = ({ originalText, modifiedText, language = 'yaml', onChange }: Props) => {
  const handleEditorDidMount = (editor: MonacoDiffEditor) => {
    const modifiedEditor = editor.getModifiedEditor();

    modifiedEditor.onDidChangeModelContent(() => {
      const changedText = modifiedEditor.getValue();
      onChange(changedText);
    });
  };

  return (
    <DiffEditor
      theme="vs-dark"
      language={language}
      original={originalText}
      modified={modifiedText}
      loading={<ProgressBitbot />}
      onMount={handleEditorDidMount}
      options={{ renderWhitespace: 'all' }}
      keepCurrentModifiedModel
      keepCurrentOriginalModel
      beforeMount={(monaco) => {
        MonacoUtils.configureForYaml(monaco);
        MonacoUtils.configureEnvVarsCompletionProvider(monaco);
      }}
    />
  );
};

export default DiffEditorComponent;
