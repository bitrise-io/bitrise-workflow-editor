import { Box, Tab, TabList, Text } from '@bitrise/bitkit';
import { BitkitLinkButton } from '@bitrise/bitkit-v2';
import { ReactNode } from 'react';

import EntityModuleProvenance from '@/components/EntityModuleProvenance';
import JumpToDefinitionLink from '@/components/JumpToDefinitionLink/JumpToDefinitionLink';
import StepBundleService from '@/core/services/StepBundleService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import useNavigation from '@/hooks/useNavigation';
import { useCrossFileEntity, useIsMergedConfigSelected, useOtherDefiningModules } from '@/hooks/useTree';

import { useStepBundleConfigContext } from './StepBundleConfig.context';

type HeaderProps = {
  variant: 'panel' | 'drawer';
};

const StepBundleConfigHeader = ({ variant }: HeaderProps) => {
  const { cvs, stepBundleId, title } = useStepBundleConfigContext((s) => ({
    cvs: s.stepBundle?.cvs || '',
    stepBundleId: s.stepBundle?.id || s.stepBundleId || '',
    title: s.stepBundle?.mergedValues?.title || s.stepBundle?.id || 'Step bundle',
  }));

  const dependants = useDependantWorkflows({ stepBundleCvs: cvs });
  const { replace } = useNavigation();

  const isMergedView = useIsMergedConfigSelected();
  const { hasDefinition } = useCrossFileEntity('stepBundles', stepBundleId);
  const otherModules = useOtherDefiningModules('stepBundles', stepBundleId);
  const shouldJumpToDefinition = otherModules.nodeIds.length > 0 || (isMergedView && hasDefinition);
  const editDefinitionLink = shouldJumpToDefinition ? (
    <JumpToDefinitionLink
      kind="stepBundles"
      id={stepBundleId}
      nodeIds={otherModules.nodeIds.length > 0 ? otherModules.nodeIds : undefined}
    />
  ) : (
    <BitkitLinkButton onClick={() => replace('/step_bundles', { step_bundle_id: stepBundleId })}>
      Edit definition
    </BitkitLinkButton>
  );

  const usedIn = StepBundleService.getUsedByText(dependants.length);
  // Panel: the provenance line owns its own jump. Drawer: the jump is the trailing editDefinitionLink,
  // so the inline provenance drops it (withJumpLink={false}) to avoid a duplicate.
  let subtitle: ReactNode = (
    <EntityModuleProvenance kind="stepBundles" id={stepBundleId} pathTextStyle="body/md/semibold" fallback={usedIn} />
  );
  if (variant === 'drawer') {
    subtitle = (
      <>
        Instance of{' '}
        <Text as="span" textStyle="body/md/semibold">
          {stepBundleId}
        </Text>{' '}
        •{' '}
        <EntityModuleProvenance
          kind="stepBundles"
          id={stepBundleId}
          pathTextStyle="body/md/semibold"
          withJumpLink={false}
          fallback={usedIn}
        />{' '}
        • {editDefinitionLink}
      </>
    );
  }

  return (
    <>
      <Box p={variant === 'panel' ? '16px 24px 0px 24px' : '0'}>
        <Text as="h3" textStyle="heading/h3">
          {title}
        </Text>
        <Text textStyle="body/md/regular" color="text/secondary">
          {subtitle}
        </Text>
      </Box>
      <TabList paddingX="8" mx={variant === 'drawer' ? '-24' : '0'} mt="16">
        <Tab>Configuration</Tab>
        <Tab>Properties</Tab>
        <Tab>Containers</Tab>
      </TabList>
    </>
  );
};

export default StepBundleConfigHeader;
