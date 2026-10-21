import { Tooltip } from '@bitrise/bitkit';
import { BitkitButton, IconPlay, IconSettings } from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useMemo } from 'react';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useIsMergedConfigSelected, useTree } from '@/hooks/useTree';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';

import usePipelineSelector from '../../hooks/usePipelineSelector';

type Props = BoxProps & {
  onRunClick?: () => void;
  onPropertiesClick?: () => void;
};

const Toolbar = ({ onRunClick, onPropertiesClick, ...props }: Props) => {
  const hasUnsavedChanges = useYmlHasChanges();
  const tree = useTree();
  const isMergedConfigSelected = useIsMergedConfigSelected();
  const isModularFileTab = !!tree && !isMergedConfigSelected;
  // The sidebar's Building blocks list picks the Pipeline now; the toolbar only names it.
  const { options, selectedPipeline } = usePipelineSelector();

  const shouldShowGraphPipelineActions = useBitriseYmlStore((s) => s.yml.pipelines?.[selectedPipeline]?.workflows);
  const isEmpty = useBitriseYmlStore((s) => {
    const pipeline = s.yml.pipelines?.[selectedPipeline];

    if (pipeline?.workflows) {
      return Object.keys(pipeline.workflows).length === 0;
    }

    if (pipeline?.stages) {
      return pipeline.stages.length === 0;
    }

    return true;
  });

  const runButtonTooltip = useMemo(() => {
    if (isModularFileTab) {
      return 'Only available in the Merged config tab';
    }

    if (hasUnsavedChanges) {
      return 'Save changes before running';
    }

    return 'Run Pipeline';
  }, [hasUnsavedChanges, isModularFileTab]);

  return (
    <Box
      {...props}
      padding="8"
      gap="8"
      display="flex"
      boxShadow="elevation/lg"
      borderRadius="12"
      justifyContent="space-between"
      backgroundColor="background/primary"
    >
      <Text flex="1" minWidth="0" alignSelf="center" paddingInline="8" textStyle="body/lg/semibold" truncate>
        {selectedPipeline ? options[selectedPipeline] : 'No Pipeline selected'}
      </Text>

      {shouldShowGraphPipelineActions && (
        <>
          <BitkitButton
            size="md"
            variant="secondary"
            icon={IconSettings}
            onClick={onPropertiesClick}
            data-clarity-unmask="true"
          >
            Properties
          </BitkitButton>
        </>
      )}

      {RuntimeUtils.isWebsiteMode() && (
        <Tooltip
          label={runButtonTooltip}
          aria-label={runButtonTooltip}
          shouldWrapChildren={isEmpty || isModularFileTab || hasUnsavedChanges}
        >
          <BitkitButton
            size="md"
            variant="secondary"
            icon={IconPlay}
            state={isEmpty || isModularFileTab || hasUnsavedChanges ? 'disabled' : undefined}
            onClick={onRunClick}
            data-clarity-unmask="true"
          >
            Run
          </BitkitButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default Toolbar;
