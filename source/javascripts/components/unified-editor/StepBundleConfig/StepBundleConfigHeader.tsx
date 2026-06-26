import { Box, Tab, TabList, Text } from '@bitrise/bitkit';
import { BitkitLinkButton } from '@bitrise/bitkit-v2';
import { ReactNode } from 'react';

import CrossFileProvenanceText from '@/components/CrossFileProvenanceText';
import JumpToDefinitionLink from '@/components/JumpToDefinitionLink/JumpToDefinitionLink';
import StepBundleService from '@/core/services/StepBundleService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import useNavigation from '@/hooks/useNavigation';
import { useCrossFileEntity, useIsMergedConfigSelected } from '@/hooks/useTree';

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
  const { isCrossFile, hasDefinition, definingPath } = useCrossFileEntity('stepBundles', stepBundleId);
  const shouldJumpToDefinition = isCrossFile || (isMergedView && hasDefinition);
  const editDefinitionLink = shouldJumpToDefinition ? (
    <JumpToDefinitionLink kind="stepBundles" id={stepBundleId} />
  ) : (
    <BitkitLinkButton onClick={() => replace('/step_bundles', { step_bundle_id: stepBundleId })}>
      Edit definition
    </BitkitLinkButton>
  );

  const usedIn = StepBundleService.getUsedByText(dependants.length);
  let subtitle: ReactNode = usedIn;
  if (variant === 'drawer') {
    const middle = isCrossFile ? (
      <CrossFileProvenanceText definingPath={definingPath} pathTextStyle="body/md/semibold" />
    ) : (
      usedIn
    );

    subtitle = (
      <>
        Instance of{' '}
        <Text as="span" textStyle="body/md/semibold">
          {stepBundleId}
        </Text>{' '}
        • {middle} • {editDefinitionLink}
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
