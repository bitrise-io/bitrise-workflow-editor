import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { TextContents, WrapperConfig } from 'monaco-editor-wrapper';
import { configureDefaultWorkerFactory } from 'monaco-editor-wrapper/workers/workerLoaders';
import { useEffect, useRef, useState } from 'react';

import LoadingState from '@/components/LoadingState';
import { bitriseYmlStore, updateYmlInStore } from '@/core/stores/BitriseYmlStore';
// import MonacoUtils from '@/core/utils/MonacoUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFormattedYml from '@/hooks/useFormattedYml';

const YmlLSPEditor = () => {
  // const monacoEditorRef = useRef<Parameters<OnMount>[0]>();
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();
  // // NOTE: Don't subscribe to the store here, because it will send a format request on every character change
  // // When switching to a different page, this will be unmounted, and on reopen the yml will be read from the store again
  const { data: formattedYml, isLoading: isLoadingFormattedYml } = useFormattedYml(bitriseYmlStore.getState().yml);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [containerReady, setContainerReady] = useState(false);
  useEffect(() => {
    // This ensures we have a container ref before rendering the editor
    if (editorContainerRef.current) {
      setContainerReady(true);
    }

    // Clean up function
    return () => {
      // Any necessary cleanup
      setContainerReady(false);
    };
  }, []);
  // useEffect(() => {
  //   return () => {
  //     monacoEditorRef.current?.dispose();
  //   };
  // }, []);

  if (isLoadingSetting || isLoadingFormattedYml) {
    return <LoadingState />;
  }

  const handleEditorChange = (modifiedYmlChange?: TextContents) => {
    try {
      updateYmlInStore(modifiedYmlChange?.modified);
    } catch (error) {
      // TODO: Should we show a notification here? This happens when the YML is invalid while typing.
    }
  };

  // const handleEditorDidMount: OnMount = (editor) => {
  //   monacoEditorRef.current = editor;
  // };

  // const onLoad = async (_: MonacoEditorLanguageClientWrapper) => {
  // };

  const getWrapperConfig = (): WrapperConfig => ({
    $type: 'extended',
    htmlContainer: editorContainerRef.current || undefined,
    editorAppConfig: {
      codeResources: {
        modified: {
          uri: '/workspace/bitrise.yml', // Change to a more appropriate URI
          text: formattedYml || '', // Ensure it's always a string
        },
      },
      monacoWorkerFactory: configureDefaultWorkerFactory,
      editorOptions: {
        value: formattedYml,
        theme: 'vs-dark',
        language: 'yaml',
        readOnly: isLoadingSetting || isLoadingFormattedYml || ymlSettings?.usesRepositoryYml,
      },
    },
  });

  return (
    <div
      ref={editorContainerRef}
      style={{
        backgroundColor: '#1f1f1f',
        height: '1000px', // Define a fixed height
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {containerReady && (
        <MonacoEditorReactComp
          wrapperConfig={getWrapperConfig()}
          style={{ height: '100%', width: '100%' }}
          onError={(e) => {
            console.error(e);
          }}
          onTextChanged={handleEditorChange}
        />
      )}
    </div>
  );

  // return (
  //   <Editor
  //     value={formattedYml}
  //     theme="vs-dark"
  //     language="yaml"
  //     keepCurrentModel
  //     onChange={handleEditorChange}
  //     onMount={handleEditorDidMount}
  //     beforeMount={(monaco) => {
  //       MonacoUtils.configureForYaml(monaco);
  //       MonacoUtils.configureEnvVarsCompletionProvider(monaco);
  //     }}
  //     options={{
  //       readOnly: isLoadingSetting || isLoadingFormattedYml || ymlSettings?.usesRepositoryYml,
  //     }}
  //   />
  // );
};

export default YmlLSPEditor;
