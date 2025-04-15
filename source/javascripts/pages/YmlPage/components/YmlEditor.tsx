import Editor from '@monaco-editor/react';

import LoadingState from '@/components/LoadingState';
import { bitriseYmlStore, updateYmlStringAndSyncYml } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useFormattedYml from '@/hooks/useFormattedYml';

const YmlEditor = () => {
  const { data: ymlSettings, isLoading: isLoadingSetting } = useCiConfigSettings();
  const { data: formattedYml, isLoading: isLoadingFormattedYml } = useFormattedYml(bitriseYmlStore.getState().yml);

  if (isLoadingSetting || isLoadingFormattedYml) {
    return <LoadingState />;
  }

  return (
    <Editor
      value={formattedYml || 'Loading...'}
      theme="vs-dark"
      language="yaml"
      keepCurrentModel
      onChange={updateYmlStringAndSyncYml}
      options={{
        readOnly: isLoadingSetting || isLoadingFormattedYml || ymlSettings?.usesRepositoryYml,
      }}
      beforeMount={(monaco) => MonacoUtils.configureForYaml(monaco)}
    />
  );
};

export default YmlEditor;
