import Editor from '@monaco-editor/react';
import MonacoUtils from '@/core/utils/MonacoUtils';
import useBitriseYmlSettings from '@/hooks/useBitriseYmlSettings';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { updateYmlString } from '@/core/stores/BitriseYmlStore';

const YmlEditor = () => {
  const { data: ymlSettings } = useBitriseYmlSettings();
  const value = useBitriseYmlStore((s) => s.ymlString);

  return (
    <Editor
      value={value}
      theme="vs-dark"
      language="yaml"
      keepCurrentModel
      onChange={updateYmlString}
      options={{ readOnly: ymlSettings.usesRepositoryYml }}
      beforeMount={(monaco) => MonacoUtils.configureForYaml(monaco)}
    />
  );
};

export default YmlEditor;
