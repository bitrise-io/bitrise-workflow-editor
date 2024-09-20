import { ProgressBitbot } from '@bitrise/bitkit';
import { DiffEditor, MonacoDiffEditor } from '@monaco-editor/react';

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
      original={originalText}
      modified={modifiedText}
      language={language}
      loading={<ProgressBitbot />}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        renderSideBySide: true,
        renderWhitespace: 'all',
        wordWrap: 'on',
      }}
    />
  );
};

export default DiffEditorComponent;
