import Editor from '@monaco-editor/react';
import MonacoUtils from '@/core/utils/MonacoUtils';
import useCiConfiSettings from '@/hooks/useCiConfiSettings';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { updateYmlStringAndSyncYml } from '@/core/stores/BitriseYmlStore';

const YmlEditor = () => {
  const { data: ymlSettings } = useCiConfiSettings();
  const value = useBitriseYmlStore((s) => s.ymlString);

  return (
    <Editor
      value={value}
      theme="vs-dark"
      language="yaml"
      keepCurrentModel
      onChange={updateYmlStringAndSyncYml}
      options={{ readOnly: ymlSettings.usesRepositoryYml }}
      beforeMount={(monaco) => MonacoUtils.configureForYaml(monaco)}
    />
  );
};

export default YmlEditor;
