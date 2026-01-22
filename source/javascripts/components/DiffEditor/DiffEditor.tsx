import { ProgressBitbot } from '@bitrise/bitkit';
import { DiffEditor, DiffEditorProps, MonacoDiffEditor } from '@monaco-editor/react';

import MonacoUtils from '@/core/utils/MonacoUtils';

type Props = {
  originalText: string;
  modifiedText: string;
  onChange: (changedText: string) => void;
  language?: string;
};

const diffEditorOptions: DiffEditorProps['options'] = {
  diffWordWrap: 'off',
  automaticLayout: true,
  roundedSelection: false,
  renderWhitespace: 'all',
  ignoreTrimWhitespace: false,
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
    <>
      <style>
        {/* This is required because for some reason the diffOverview doesn't use the theme background color and remain white otherwise */}
        {`.monaco-diff-editor .diffOverview {
          background-color: var(--vscode-editor-background);
        }
        .monaco-diff-editor .gutterItem {
          opacity: 1 !important;
        }
      `}
      </style>
      <DiffEditor
        theme="vs-dark"
        language={language}
        original={originalText}
        modified={modifiedText}
        options={diffEditorOptions}
        loading={<ProgressBitbot />}
        onMount={handleEditorDidMount}
        keepCurrentModifiedModel
        keepCurrentOriginalModel
        wrapperProps={{ style: { flex: 1, display: 'flex' } }}
        beforeMount={(monaco) => {
          MonacoUtils.configureForYaml(monaco);
          MonacoUtils.configureBitriseLanguageServer(monaco);
          MonacoUtils.configureEnvVarsCompletionProvider(monaco);
        }}
      />
    </>
  );
};

export default DiffEditorComponent;
