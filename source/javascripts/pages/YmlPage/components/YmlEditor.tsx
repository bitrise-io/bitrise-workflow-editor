import Editor, { OnMount } from '@monaco-editor/react';
import { useRef } from 'react';
import { useUnmount } from 'usehooks-ts';

import LoadingState from '@/components/LoadingState';
import { getYmlString, setBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import YmlUtils from '@/core/utils/YmlUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';

const YmlEditor = () => {
  const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();

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

    const doc = YmlUtils.toDoc(modifiedYmlString);
    if (doc.errors.length === 0) {
      setBitriseYmlDocument(doc);
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
