import { BitkitButton, BitkitHeading, BitkitTabs, IconSparkleFilled } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

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
  } = useAIButton({ action: 'explain_pipeline', source: 'pipeline_drawer', yamlSelector: `pipelines.${pipelineId}` });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();

  if (!pipelineId) {
    return null;
  }

  return (
    <BitkitTabs.Root defaultValue="properties">
      <FloatingDrawer {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Box display="flex" gap="16">
              <BitkitHeading as="h3">{pipelineId}</BitkitHeading>
              {isAIButtonVisible && (
                <BitkitButton
                  state={isAIButtonDisabled ? 'disabled' : undefined}
                  disabledReason={tooltipLabel}
                  icon={IconSparkleFilled}
                  size="sm"
                  variant="ai-secondary"
                  onClick={onAIButtonClick}
                >
                  Explain
                </BitkitButton>
              )}
            </Box>
            <BitkitTabs.List marginInline="-24" marginBlockStart="16" paddingInline="8" data-clarity-unmask="true">
              <BitkitTabs.Trigger value="properties">Properties</BitkitTabs.Trigger>
              <BitkitTabs.Trigger value="triggers">Triggers</BitkitTabs.Trigger>
            </BitkitTabs.List>
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <BitkitTabs.ContentGroup height="100%">
              <BitkitTabs.Content value="properties">
                <PropertiesTab onDelete={props.onClose} pipelineId={pipelineId} />
              </BitkitTabs.Content>
              <BitkitTabs.Content value="triggers" overflowY="auto" height="100%">
                <TriggersTab pipelineId={pipelineId} />
              </BitkitTabs.Content>
            </BitkitTabs.ContentGroup>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </BitkitTabs.Root>
  );
};

export default PipelineConfigDrawer;
