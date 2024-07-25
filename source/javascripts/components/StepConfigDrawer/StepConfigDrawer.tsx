import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react';
import {
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  Box,
  Avatar,
  Text,
  ButtonGroup,
  IconButton,
  Button,
  TabPanels,
  TabPanel,
} from '@bitrise/bitkit';
import StepBadge from '../StepBadge/StepBadge';
import useStep from './hooks/useStep';
import { normalizeStepVersion, parseStepCVS } from '@/models/Step';

type Props = UseDisclosureProps & {
  workflowId: string;
  stepIndex: number;
};

const StepConfigDrawer = ({ workflowId, stepIndex, ...disclosureProps }: Props) => {
  const step = useStep(workflowId, stepIndex);
  const { isOpen, onClose } = useDisclosure(disclosureProps);

  if (!step) {
    return null;
  }

  const [id, version] = parseStepCVS(step.id);
  const normalizedVersion = normalizeStepVersion(version || '');

  return (
    <Tabs>
      <Drawer isFullHeight isOpen={isOpen} onClose={onClose} autoFocus={false}>
        <DrawerOverlay
          top={0}
          bg="linear-gradient(to left, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);"
        />
        <DrawerContent
          top={0}
          gap="0"
          padding={0}
          display="flex"
          flexDir="column"
          margin={[0, 32]}
          overflow="hidden"
          boxShadow="large"
          borderRadius={[0, 12]}
          maxWidth={['100%', '50%']}
        >
          <DrawerHeader color="initial" textTransform="initial" fontWeight="initial">
            <Box display="flex" px="24" pt="24" gap="16">
              <Avatar
                name="ci"
                size="48"
                variant="step"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="border/minimal"
                src="https://bitrise-steplib-collection.s3.amazonaws.com/steps/git-clone/assets/icon.svg"
              />

              <Box flex="1" minW={0}>
                <Box display="flex" gap="4" alignItems="center">
                  <Text as="h3" textStyle="heading/h3" hasEllipsis>
                    {step.title || id}
                  </Text>
                  <StepBadge isOfficial />
                </Box>

                <Box h="20px" display="flex" gap="8" alignItems="center">
                  <Text textStyle="body/md/regular" color="text/secondary">
                    v{normalizedVersion}
                  </Text>
                </Box>
              </Box>

              <ButtonGroup>
                <IconButton
                  size="sm"
                  iconName="ArrowUp"
                  variant="secondary"
                  aria-label="Update to latest step version"
                />
                <IconButton size="sm" variant="secondary" iconName="Duplicate" aria-label="Clone this step" />
                <IconButton
                  size="sm"
                  variant="secondary"
                  iconName="MinusRemove"
                  aria-label="Remove this step"
                  isDanger
                />
              </ButtonGroup>
            </Box>
            <Box position="relative" mt="8">
              <TabList paddingX="8">
                <Tab id="configuration">Configuration</Tab>
                <Tab id="properties">Properties</Tab>
                <Tab id="output-variables">Output variables</Tab>
              </TabList>
            </Box>
          </DrawerHeader>
          <DrawerBody p="16" flex="1" overflowY="auto">
            <TabPanels>
              <TabPanel id="configuration">Configuration</TabPanel>
              <TabPanel id="properties">Properties</TabPanel>
              <TabPanel id="output-variables">Output variables</TabPanel>
            </TabPanels>
          </DrawerBody>
          <DrawerFooter p="32" boxShadow="large">
            <ButtonGroup spacing={16}>
              <Button>Done</Button>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </ButtonGroup>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Tabs>
  );
};

export default StepConfigDrawer;
