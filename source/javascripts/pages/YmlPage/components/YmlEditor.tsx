import Editor, { OnMount } from '@monaco-editor/react';
import { useRef } from 'react';
import { useUnmount } from 'usehooks-ts';

import LoadingState from '@/components/LoadingState';
import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import YmlUtils from '@/core/utils/YmlUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';

const YmlEditor = () => {
  const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();

  useUnmount(() => {
    monacoEditorRef.current?.dispose();
  });

  if (isLoadingSetting) {
    return <LoadingState />;
  }

  const hasErrorsInYml = (ymlString?: string) => {
    return YmlUtils.toDoc(ymlString || '').errors.length > 0;
  };

  const handleEditorChange = (modifiedYmlString?: string) => {
    if (!hasErrorsInYml(modifiedYmlString)) {
      updateBitriseYmlDocumentByString(modifiedYmlString ?? '');
    }
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
      }}
      options={{
        readOnly: isLoadingSetting || ymlSettings?.usesRepositoryYml,
      }}
    />
  );
};

export default YmlEditor;
