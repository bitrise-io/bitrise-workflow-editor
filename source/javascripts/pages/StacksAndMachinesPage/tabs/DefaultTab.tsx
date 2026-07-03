import { Text } from '@bitrise/bitkit';
import { BitkitControlButton, IconArrowNortheast } from '@bitrise/bitkit-v2';
import { useMemo } from 'react';

import FilePickerMenu from '@/components/JumpToDefinitionLink/FilePickerMenu';
import DefaultStackAndMachine from '@/components/StacksAndMachine/DefaultStackAndMachine';
import TabContainer from '@/components/tabs/TabContainer';
import { openTab, recordActiveTabLocation } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import {
  ROOT_META_STACK_FIELDS,
  useInheritedDefaultStack,
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
  const inheritedDefault = useInheritedDefaultStack();

  // Whether the active document itself defines a default stack/machine. On a single module-file tab
  // `yml` is that file; on the merged tab it's the whole config. Key presence (not truthiness) so a
  // falsy-but-set value like `stack_rollback_version: 0` still counts — matching useRootMetaStackDefinitions.
  const hasLocalDefault = useBitriseYmlStore((s) => {
    const meta = s.yml.meta?.['bitrise.io'];
    return Boolean(meta && ROOT_META_STACK_FIELDS.some((field) => field in meta));
  });

  // Jump-to-definition arrow over the file(s) defining the default. Rendered inside the stack card
  // (trailing the selectors), not in a separate header above it.
  const jumpButton =
    tree && metaNodeIds.length > 0 ? (
      <FilePickerMenu
        rootNode={tree}
        nodeIds={metaNodeIds}
        onSelect={(nodeId) => {
          recordActiveTabLocation(window.parent.location.hash);
          openTab(nodeId, { preview: false });
        }}
        trigger={<BitkitControlButton size="xs" icon={IconArrowNortheast} label="Edit definition" />}
      />
    ) : null;

  // Merged (read-only) view: show where the default is defined + a jump; the values come from the
  // merged document (StackAndMachine renders read-only on the merged view).
  if (isModular && isMergedView) {
    const definingPath = metaDefinitions.length
      ? `${metaDefinitions[0].path}${metaDefinitions.length > 1 ? ` (+${metaDefinitions.length - 1} more)` : ''}`
      : undefined;

    return (
      <TabContainer>
        <DefaultStackAndMachine definingPath={definingPath} selectsTrailing={jumpButton} />
      </TabContainer>
    );
  }

  // Module tab that doesn't define the default: show the inherited default read-only, sourced from the
  // defining module, with a jump to where it's actually defined.
  if (isModular && !hasLocalDefault) {
    if (!inheritedDefault) {
      return (
        <TabContainer>
          <Text textStyle="body/md/regular" color="text/secondary">
            No default stack & machine is defined.
          </Text>
        </TabContainer>
      );
    }

    return (
      <TabContainer>
        <DefaultStackAndMachine
          definingPath={inheritedDefault.definingPath}
          value={inheritedDefault.value}
          readOnly
          selectsTrailing={jumpButton}
        />
      </TabContainer>
    );
  }

  // Single-file config, or a module that defines its own default: editable, no provenance.
  return (
    <TabContainer>
      <DefaultStackAndMachine />
    </TabContainer>
  );
};

export default DefaultTab;
