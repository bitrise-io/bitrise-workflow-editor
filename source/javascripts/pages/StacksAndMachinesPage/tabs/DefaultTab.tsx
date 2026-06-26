import { Box, Text } from '@bitrise/bitkit';
import { BitkitControlButton, IconArrowNortheast } from '@bitrise/bitkit-v2';
import { useMemo } from 'react';

import FilePickerMenu from '@/components/JumpToDefinitionLink/FilePickerMenu';
import DefaultStackAndMachine from '@/components/StacksAndMachine/DefaultStackAndMachine';
import TabContainer from '@/components/tabs/TabContainer';
import { openTab } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import {
  ROOT_META_STACK_FIELDS,
  useIsMergedConfigSelected,
  useRootMetaStackDefinitions,
  useTree,
} from '@/hooks/useTree';

const DefaultTab = () => {
  const tree = useTree();
  const isModular = Boolean(tree);
  const isMergedView = useIsMergedConfigSelected();
  const metaDefinitions = useRootMetaStackDefinitions();
  // Memoized so the picker's restricted node set keeps a stable identity across renders
  // (a fresh array would rebuild FileTreeView's collection and reset its expansion state).
  const metaNodeIds = useMemo(() => metaDefinitions.map((definition) => definition.nodeId), [metaDefinitions]);

  // Whether the active document itself defines a default stack/machine. On a single module-file tab
  // `yml` is that file; on the merged tab it's the whole config. Key presence (not truthiness) so a
  // falsy-but-set value like `stack_rollback_version: 0` still counts — matching useRootMetaStackDefinitions.
  const hasLocalDefault = useBitriseYmlStore((s) => {
    const meta = s.yml.meta?.['bitrise.io'];
    return Boolean(meta && ROOT_META_STACK_FIELDS.some((field) => field in meta));
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
            {metaDefinitions.length > 1 ? ` (+${metaDefinitions.length - 1} more)` : ''}
          </Text>
          {tree && (
            <FilePickerMenu
              rootNode={tree}
              nodeIds={metaNodeIds}
              onSelect={(nodeId) => openTab(nodeId, { preview: false })}
              trigger={<BitkitControlButton size="xs" icon={IconArrowNortheast} label="Edit definition" />}
            />
          )}
        </Box>
      )}
      <DefaultStackAndMachine />
    </TabContainer>
  );
};

export default DefaultTab;
