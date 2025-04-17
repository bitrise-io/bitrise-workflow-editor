import Editor from '@monaco-editor/react';

import LoadingState from '@/components/LoadingState';
import { bitriseYmlStore, updateYmlInStore } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFormattedYml from '@/hooks/useFormattedYml';

const YmlEditor = () => {
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();
  // NOTE: Don't subscribe to the store here, because it will send a format request on every character change
  // When switching to a different page, this will be unmounted, and on reopen the yml will be read from the store again
  const { data: formattedYml, isLoading: isLoadingFormattedYml } = useFormattedYml(bitriseYmlStore.getState().yml);

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

  return (
    <Editor
      value={formattedYml || 'Loading...'}
      theme="vs-dark"
      language="yaml"
      keepCurrentModel
      onChange={handleEditorChange}
      options={{
        readOnly: isLoadingSetting || isLoadingFormattedYml || ymlSettings?.usesRepositoryYml,
      }}
      beforeMount={(monaco) => MonacoUtils.configureForYaml(monaco)}
    />
  );
};

export default YmlEditor;
