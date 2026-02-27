import { Box, Link, Tab, TabList, Text } from '@bitrise/bitkit';
import { ReactNode, useCallback } from 'react';

import StepBundleService from '@/core/services/StepBundleService';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import { findFileIndexForEntity, modularConfigStore, setActiveFileIndex } from '@/core/stores/ModularConfigStore';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import useNavigation from '@/hooks/useNavigation';

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

  const handleEditDefinition = useCallback(() => {
    const { isModular } = modularConfigStore.getState();
    if (isModular && stepBundleId) {
      const fileIndex = findFileIndexForEntity('step_bundles', stepBundleId);
      if (fileIndex >= 0) {
        const version = bitriseYmlStore.getState().version;
        setActiveFileIndex(fileIndex, version);
      }
    }
    replace('/step_bundles', { step_bundle_id: stepBundleId });
  }, [stepBundleId, replace]);

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
        <Link as="button" colorScheme="purple" onClick={handleEditDefinition}>
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
      </TabList>
    </>
  );
};

export default StepBundleConfigHeader;
