import { Text } from '@bitrise/bitkit';

import JumpToFileButton from '@/components/JumpToDefinitionLink/JumpToFileButton';
import DefaultStackAndMachine from '@/components/StacksAndMachine/DefaultStackAndMachine';
import TabContainer from '@/components/tabs/TabContainer';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import {
  ROOT_META_STACK_FIELDS,
  useDefaultStackDefinitions,
  useIsMergedConfigSelected,
  useTree,
} from '@/hooks/useTree';

const DefaultTab = () => {
  const tree = useTree();
  const isModular = Boolean(tree);
  const isMergedView = useIsMergedConfigSelected();
  const defaultDefinitions = useDefaultStackDefinitions();
  // The effective inherited default for a module that doesn't define its own: the top-most (winning)
  // definition. Derived from defaultDefinitions rather than a second hook, to avoid walking the tree twice.
  const topDefault = defaultDefinitions[0];
  const inheritedDefault = topDefault
    ? {
        definingPath: topDefault.path,
        value: topDefault.value,
        nodeIds: defaultDefinitions.map((definition) => definition.nodeId),
      }
    : undefined;

  // Whether the active document itself defines a default stack/machine. On a single module-file tab
  // `yml` is that file; on the merged tab it's the whole config. Key presence (not truthiness) so a
  // falsy-but-set value like `stack_rollback_version: 0` still counts — matching useDefaultStackDefinitions.
  const hasLocalDefault = useBitriseYmlStore((s) => {
    const meta = s.yml.meta?.['bitrise.io'];
    return Boolean(meta && ROOT_META_STACK_FIELDS.some((field) => field in meta));
  });

  // Merged (read-only) view: one card per module that defines a default (BIVS-3714), each with its own
  // "Defined in …" + a jump to that file. When no module defines one, a single card shows the hidden
  // (platform) default with no provenance.
  if (isModular && isMergedView) {
    if (defaultDefinitions.length === 0) {
      return (
        <TabContainer>
          <DefaultStackAndMachine />
        </TabContainer>
      );
    }

    return (
      <TabContainer>
        {defaultDefinitions.map((definition) => (
          <DefaultStackAndMachine
            key={definition.nodeId}
            definingPath={definition.path}
            value={definition.value}
            readOnly
            selectsTrailing={<JumpToFileButton nodeId={definition.nodeId} />}
          />
        ))}
      </TabContainer>
    );
  }

  // Module tab that doesn't define its own default: pre-fill the inherited value (sourced from the
  // defining module) and show where it currently comes from + a jump, but keep the selectors editable
  // so the module can set its own default — editing writes it to this file. (The merged/ghost views
  // stay read-only via useIsReadOnlyView, independent of this.)
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
          selectsTrailing={<JumpToFileButton nodeId={inheritedDefault.nodeIds[0]} />}
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
