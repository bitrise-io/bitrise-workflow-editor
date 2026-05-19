import Editor, { OnMount } from '@monaco-editor/react';
import { useRef } from 'react';
import { useUnmount } from 'usehooks-ts';

import LoadingState from '@/components/LoadingState';
import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { BACKGROUND_MODEL_URI } from '@/hooks/useYmlLanguageServices';

const YmlEditor = () => {
  const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const enableBranchSwitching = useFeatureFlag('enable-branch-switching');
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
      path={BACKGROUND_MODEL_URI.toString()}
      defaultValue={getYmlString()}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        readOnly: isLoadingSetting || (!enableBranchSwitching && ymlSettings?.usesRepositoryYml),
      }}
    />
  );
};

export default YmlEditor;
