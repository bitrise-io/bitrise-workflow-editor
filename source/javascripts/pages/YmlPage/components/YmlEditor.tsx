import Editor, { OnMount } from '@monaco-editor/react';
import { useRef } from 'react';
import { useUnmount } from 'usehooks-ts';

import LoadingState from '@/components/LoadingState';
import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFeatureFlag from '@/hooks/useFeatureFlag';

const YmlEditor = () => {
  const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();
  const enableWfeBitriseLanguageServer = useFeatureFlag('enable-wfe-bitrise-language-server');

  useUnmount(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.dispose();
      monacoEditorRef.current = undefined;
    }
  });

  if (isLoadingSetting) {
    return <LoadingState />;
  }

  const handleEditorChange = (modifiedYmlString?: string) => {
    if (!monacoEditorRef.current || typeof modifiedYmlString !== 'string') {
      return;
    }

    updateBitriseYmlDocumentByString(modifiedYmlString);
  };

  const handleEditorDidMount: OnMount = (editor) => {
    monacoEditorRef.current = editor;
  };

  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      keepCurrentModel
      defaultValue={getYmlString()}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      beforeMount={(monaco) => {
        MonacoUtils.configureForYaml(monaco);
        MonacoUtils.configureEnvVarsCompletionProvider(monaco);
        if (enableWfeBitriseLanguageServer) MonacoUtils.configureBitriseLanguageServer(monaco);
      }}
      options={{
        readOnly: isLoadingSetting || ymlSettings?.usesRepositoryYml,
      }}
    />
  );
};

export default YmlEditor;
