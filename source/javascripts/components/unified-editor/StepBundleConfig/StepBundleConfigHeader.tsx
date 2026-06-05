import { Box, Link, Tab, TabList, Text } from '@bitrise/bitkit';
import { ReactNode } from 'react';

import JumpToDefinitionLink from '@/components/JumpToDefinitionLink/JumpToDefinitionLink';
import EntityIndexService from '@/core/services/EntityIndexService';
import StepBundleService from '@/core/services/StepBundleService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useNavigation from '@/hooks/useNavigation';
import { useDefiningFilePath, useIsMergedConfigSelected } from '@/hooks/useTree';

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

  // When the definition lives in another module file (cross-file reference) the
  // drawer is editing only the instance-level overrides; "Edit definition" must
  // jump to the defining file's tab rather than navigate within this one. In
  // single-file mode the index is empty, so `definedElsewhere` is always false
  // and the existing in-file navigation is used unchanged.
  // On the merged view the definition resolves locally but lives in a specific
  // module — jump to it rather than navigate within the read-only merged doc.
  const isMergedView = useIsMergedConfigSelected();
  const isLocal = useBitriseYmlStore(({ yml }) => Boolean(yml.step_bundles?.[stepBundleId]));
  const isCrossFile = !isLocal && Boolean(EntityIndexService.definingNodeId(entityIndex, 'stepBundles', stepBundleId));
  const shouldJumpToDefinition =
    (!isLocal || isMergedView) && Boolean(EntityIndexService.definingNodeId(entityIndex, 'stepBundles', stepBundleId));
  // Cross-file (or merged) → jump to the defining file, with a chooser when the
  // bundle is defined in more than one layer. Local → navigate within this file.
  const editDefinitionLink = shouldJumpToDefinition ? (
    <JumpToDefinitionLink kind="stepBundles" id={stepBundleId}>
      Edit definition
    </JumpToDefinitionLink>
  ) : (
    <Link as="button" colorScheme="purple" onClick={() => replace('/step_bundles', { step_bundle_id: stepBundleId })}>
      Edit definition
    </Link>
  );
  const definingPath = useDefiningFilePath('stepBundles', stepBundleId);

  const usedIn = StepBundleService.getUsedByText(dependants.length);
  let subtitle: ReactNode = usedIn;
  if (variant === 'drawer') {
    // "used in N" counts dependants in the active file only — meaningless for a
    // cross-file reference, so it's replaced by the defining file's path there.
    const middle = isCrossFile ? (
      <>
        Defined in{' '}
        {definingPath ? (
          <Text as="span" textStyle="body/md/semibold">
            {definingPath}
          </Text>
        ) : (
          'another file'
        )}
      </>
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
