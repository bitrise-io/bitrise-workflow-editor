import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@bitrise/bitkit';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import PropertiesTab from './tabs/PropertiesTab';
import TriggersTab from './tabs/TriggersTab';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  pipelineId: string;
};

const PipelineConfigDrawer = ({ pipelineId, ...props }: Props) => {
  if (!pipelineId) {
    return null;
  }

  return (
    <Tabs>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Text as="h3" textStyle="heading/h3">
              {pipelineId}
            </Text>
            <Box mx="-24" mt="16">
              <TabList px="8">
                <Tab>Properties</Tab>
                <Tab>Triggers</Tab>
              </TabList>
            </Box>
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <TabPanels>
              <TabPanel>
                <PropertiesTab onClose={props.onClose} pipelineId={pipelineId} />
              </TabPanel>
              <TabPanel>
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
