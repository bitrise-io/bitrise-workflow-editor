import Editor, { OnMount } from '@monaco-editor/react';
import { useRef } from 'react';
import { useUnmount } from 'usehooks-ts';

import LoadingState from '@/components/LoadingState';
import { getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import { modularConfigStore, updateFileContents } from '@/core/stores/ModularConfigStore';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useIsModular from '@/hooks/useIsModular';
import useModularConfig from '@/hooks/useModularConfig';
import { BACKGROUND_MODEL_URI } from '@/hooks/useYmlLanguageServices';

const YmlEditor = () => {
  const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();
  const isModular = useIsModular();
  const activeFileIndex = useModularConfig((s) => s.activeFileIndex);
  const activeFile = useModularConfig((s) => (s.activeFileIndex >= 0 ? s.files[s.activeFileIndex] : undefined));

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

    if (isModular && activeFileIndex >= 0) {
      updateFileContents(activeFileIndex, modifiedYmlString);
    }

    updateBitriseYmlDocumentByString(modifiedYmlString);
  };

  const handleEditorDidMount: OnMount = (editor) => {
    monacoEditorRef.current = editor;
  };

  let isReadOnly: boolean | undefined = isLoadingSetting;
  if (isModular) {
    if (activeFileIndex === -1) {
      isReadOnly = true;
    } else if (activeFile?.isReadOnly) {
      isReadOnly = true;
    }
  } else if (ymlSettings?.usesRepositoryYml) {
    isReadOnly = true;
  }

  const editorValue = isModular
    ? activeFileIndex === -1
      ? modularConfigStore.getState().mergedYmlString
      : activeFile?.currentContents ?? ''
    : getYmlString();

  return (
    <Editor
      key={isModular ? `modular-${activeFileIndex}` : 'single'}
      theme="vs-dark"
      language="yaml"
      keepCurrentModel={!isModular}
      path={isModular ? undefined : BACKGROUND_MODEL_URI.toString()}
      defaultValue={editorValue}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        readOnly: isReadOnly,
      }}
    />
  );
};

export default YmlEditor;
