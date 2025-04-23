import Editor, { OnMount } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';

import LoadingState from '@/components/LoadingState';
import { bitriseYmlStore, updateYmlInStore } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFormattedYml from '@/hooks/useFormattedYml';

const YmlEditor = () => {
  const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();
  // NOTE: Don't subscribe to the store here, because it will send a format request on every character change
  // When switching to a different page, this will be unmounted, and on reopen the yml will be read from the store again
  const { data: formattedYml, isLoading: isLoadingFormattedYml } = useFormattedYml(bitriseYmlStore.getState().yml);

  useEffect(() => {
    return () => {
      monacoEditorRef.current?.dispose();
    };
  }, []);

  if (isLoadingSetting || isLoadingFormattedYml) {
    return <LoadingState />;
  }

  const handleEditorChange = (modifiedYmlString?: string) => {
    try {
      updateYmlInStore(modifiedYmlString);
    } catch (error) {
      // TODO: Should we show a notification here? This happens when the YML is invalid while typing.
    }
  };

  const handleEditorDidMount: OnMount = (editor) => {
    monacoEditorRef.current = editor;
  };

  return (
    <Editor
      value={formattedYml}
      theme="vs-dark"
      language="yaml"
      keepCurrentModel
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      beforeMount={(monaco) => {
        MonacoUtils.configureForYaml(monaco);
        MonacoUtils.configureEnvVarsCompletionProvider(monaco);
      }}
      options={{
        readOnly: isLoadingSetting || isLoadingFormattedYml || ymlSettings?.usesRepositoryYml,
      }}
    />
  );
};

export default YmlEditor;
