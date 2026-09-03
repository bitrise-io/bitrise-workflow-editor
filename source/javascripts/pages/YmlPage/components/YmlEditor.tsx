import Editor, { OnMount } from '@monaco-editor/react';
import { useRef } from 'react';

import LoadingState from '@/components/LoadingState';
import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import { BACKGROUND_MODEL_URI } from '@/hooks/useYmlLanguageServices';

const YmlEditor = () => {
  const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const enableBranchSwitching = useFeatureFlag('enable-branch-switching');
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();

  // NOTE: The editor is NOT disposed here. `<Editor>` created it and disposes it on unmount itself,
  // after saving its view state (`keepCurrentModel` leaves the model — shared with the language
  // service — alone). Disposing it first ran that teardown against an already-disposed widget,
  // which both lost the view state and tore the editor's contributions down out of order.

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
