import { Box, Link, Tab, TabList, Text } from '@bitrise/bitkit';
import { ReactNode } from 'react';

import EntityIndexService from '@/core/services/EntityIndexService';
import StepBundleService from '@/core/services/StepBundleService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useJumpToDefinition from '@/hooks/useJumpToDefinition';
import useNavigation from '@/hooks/useNavigation';
import { useIsMergedConfigSelected } from '@/hooks/useTree';

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
  const entityIndex = useEntityIndex();
  const jumpToDefinition = useJumpToDefinition();

  // When the definition lives in another module file (cross-file reference) the
  // drawer is editing only the instance-level overrides; "Edit definition" must
  // jump to the defining file's tab rather than navigate within this one. In
  // single-file mode the index is empty, so `definedElsewhere` is always false
  // and the existing in-file navigation is used unchanged.
  // On the merged view the definition resolves locally but lives in a specific
  // module — jump to it rather than navigate within the read-only merged doc.
  const isMergedView = useIsMergedConfigSelected();
  const isLocal = useBitriseYmlStore(({ yml }) => Boolean(yml.step_bundles?.[stepBundleId]));
  const shouldJumpToDefinition =
    (!isLocal || isMergedView) && Boolean(EntityIndexService.definingNodeId(entityIndex, 'stepBundles', stepBundleId));
  const onEditDefinition = shouldJumpToDefinition
    ? () => jumpToDefinition('stepBundles', stepBundleId)
    : () => replace('/step_bundles', { step_bundle_id: stepBundleId });

  const usedIn = StepBundleService.getUsedByText(dependants.length);
  let subtitle: ReactNode = usedIn;
  if (variant === 'drawer') {
    subtitle = (
      <>
        Instance of{' '}
        <Text as="span" textStyle="body/md/semibold">
          {stepBundleId}
        </Text>{' '}
        • {usedIn} •{' '}
        <Link as="button" colorScheme="purple" onClick={onEditDefinition}>
          Edit definition
        </Link>
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
