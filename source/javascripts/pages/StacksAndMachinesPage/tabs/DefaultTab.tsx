import { Box, ControlButton, Text } from '@bitrise/bitkit';

import FilePickerPopover from '@/components/JumpToDefinitionLink/FilePickerPopover';
import DefaultStackAndMachine from '@/components/StacksAndMachine/DefaultStackAndMachine';
import TabContainer from '@/components/tabs/TabContainer';
import { openTab } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useIsMergedConfigSelected, useRootMetaStackDefinitions, useTree } from '@/hooks/useTree';

const DefaultTab = () => {
  const tree = useTree();
  const isModular = Boolean(tree);
  const isMergedView = useIsMergedConfigSelected();
  const metaDefinitions = useRootMetaStackDefinitions();

  // Whether the active document itself defines a default stack/machine. On a single module-file tab
  // `yml` is that file; on the merged tab it's the whole config.
  const hasLocalDefault = useBitriseYmlStore((s) => {
    const meta = s.yml.meta?.['bitrise.io'];
    return Boolean(meta && (meta.stack || meta.machine_type_id || meta.stack_rollback_version));
  });

  // Modular single module-file tab that doesn't define the default → nothing to show here.
  if (isModular && !isMergedView && !hasLocalDefault) {
    return (
      <TabContainer>
        <Text textStyle="body/md/regular" color="text/secondary">
          No default stack & machine is defined in this file.
        </Text>
      </TabContainer>
    );
  }

  // Merged (read-only) view: show where the default is defined + a jump-to-definition arrow.
  const showDefinition = isMergedView && metaDefinitions.length > 0;

  return (
    <TabContainer>
      {showDefinition && (
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" mb="8">
          <Text textStyle="body/sm/regular" color="text/secondary">
            Defined in {metaDefinitions[0].path}
          </Text>
          {tree && (
            <FilePickerPopover
              rootNode={tree}
              nodeIds={metaDefinitions.map((definition) => definition.nodeId)}
              onSelect={(nodeId) => openTab(nodeId, { preview: false })}
              trigger={
                <ControlButton
                  size="xs"
                  iconName="ArrowNorthEast"
                  aria-label="Go to definition"
                  tooltipProps={{ 'aria-label': 'Go to definition' }}
                />
              }
            />
          )}
        </Box>
      )}
      <DefaultStackAndMachine />
    </TabContainer>
  );
};

export default DefaultTab;
