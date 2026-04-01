import { Box, Button, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Tooltip } from '@bitrise/bitkit';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import useAIButton from '@/hooks/useAIButton';

import PropertiesTab from './tabs/PropertiesTab';
import TriggersTab from './tabs/TriggersTab';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  pipelineId: string;
};

const PipelineConfigDrawer = ({ pipelineId, ...props }: Props) => {
  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({ action: 'explain_pipeline', yamlSelector: `pipelines.${pipelineId}` });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();

  if (!pipelineId) {
    return null;
  }

  return (
    <Tabs>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Box display="flex" gap="16">
              <Text as="h3" textStyle="heading/h3">
                {pipelineId}
              </Text>
              {isAIButtonVisible && (
                <Tooltip label={tooltipLabel} isDisabled={!tooltipLabel}>
                  <Button
                    isDisabled={isAIButtonDisabled}
                    leftIconName="SparkleFilled"
                    size="sm"
                    variant="ai-secondary"
                    onClick={onAIButtonClick}
                  >
                    Explain
                  </Button>
                </Tooltip>
              )}
            </Box>
            <Box mx="-24" mt="16">
              <TabList px="8">
                <Tab>Properties</Tab>
                <Tab>Triggers</Tab>
              </TabList>
            </Box>
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <TabPanels height="100%">
              <TabPanel>
                <PropertiesTab onDelete={props.onClose} pipelineId={pipelineId} />
              </TabPanel>
              <TabPanel overflowY="auto" h="100%">
                <TriggersTab pipelineId={pipelineId} />
              </TabPanel>
            </TabPanels>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
  );
};

export default PipelineConfigDrawer;
