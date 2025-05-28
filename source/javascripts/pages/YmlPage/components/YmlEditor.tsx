import Editor, { OnMount } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';

import LoadingState from '@/components/LoadingState';
import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';

const YmlEditor = () => {
  const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();

  useEffect(() => {
    return () => {
      monacoEditorRef.current?.dispose();
    };
  }, []);

  if (isLoadingSetting) {
    return <LoadingState />;
  }

  const handleEditorChange = (modifiedYmlString?: string) => {
    updateBitriseYmlDocumentByString(modifiedYmlString ?? '');
  };

  const handleEditorDidMount: OnMount = (editor) => {
    monacoEditorRef.current = editor;
  };

  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      keepCurrentModel
      value={getYmlString()}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      beforeMount={(monaco) => {
        MonacoUtils.configureForYaml(monaco);
        MonacoUtils.configureEnvVarsCompletionProvider(monaco);
      }}
      options={{
        readOnly: isLoadingSetting || ymlSettings?.usesRepositoryYml,
      }}
    />
  );
};

export default YmlEditor;
