import { Box, ButtonGroup, Card, List, ListItem, Text, Tooltip } from '@bitrise/bitkit';
import { BitkitButton, BitkitLink, IconArrowNortheast, IconPlus, IconSparkleFilled } from '@bitrise/bitkit-v2';
import { Image } from '@chakra-ui/react/image';

import useAIButton from '@/hooks/useAIButton';
import { useIsReadOnlyView } from '@/hooks/useTree';

import graphPipelineImage from '../../assets/graph-pipeline.png';

type Props = {
  onCreate: VoidFunction;
};

const CreateFirstGraphPipelineEmptyState = ({ onCreate }: Props) => {
  const isReadOnlyView = useIsReadOnlyView();
  const {
    isVisible: isAIButtonVisible,
    tooltipLabel,
    getAIButtonProps,
  } = useAIButton({
    action: 'create_pipeline',
    source: 'pipeline_empty_state',
    yamlSelector: 'pipelines',
  });
  const { isDisabled: isAIButtonDisabled, onClick: onAIButtonClick } = getAIButtonProps();

  const actions = (
    <Box display="flex" flexDir={isAIButtonVisible ? 'column' : 'row'} alignItems="center" gap="24">
      <ButtonGroup spacing="0" gap="24">
        {isAIButtonVisible && (
          <Tooltip label={tooltipLabel} isDisabled={!tooltipLabel}>
            <BitkitButton
              state={isAIButtonDisabled ? 'disabled' : undefined}
              icon={IconSparkleFilled}
              size="md"
              variant="ai-primary"
              onClick={onAIButtonClick}
            >
              Create Pipeline with AI
            </BitkitButton>
          </Tooltip>
        )}
        <BitkitButton alignSelf={['stretch', 'center']} icon={IconPlus} size="md" onClick={onCreate}>
          Create Pipeline
        </BitkitButton>
      </ButtonGroup>
      <BitkitLink
        isExternal
        colorVariant="purple"
        textStyle="body/md/regular"
        href="https://docs.bitrise.io/en/bitrise-ci/workflows-and-pipelines/build-pipelines/about-pipelines.html"
        suffixIcon={IconArrowNortheast}
        suffixIconSize="16"
      >
        Read the docs
      </BitkitLink>
    </Box>
  );

  return (
    <Box
      p="24"
      flex="1"
      display="flex"
      justifyContent="center"
      alignItems={['flex-start', 'center']}
      bg="background/secondary"
    >
      <Card
        p="24"
        display="flex"
        flexDir={['column', 'row']}
        gap="32"
        variant="outline"
        width="auto"
        data-clarity-unmask="true"
      >
        <Box maxW="420" display="flex" flexDir="column" gap="16">
          <Text as="h3" textStyle="heading/h3">
            Get started with Pipelines
          </Text>

          <List flex="1" variant="unordered" pl="8" textStyle="body/md/regular">
            <ListItem>Parallelize tasks for faster build cycles</ListItem>
            <ListItem>
              Every Pipeline run is visualized in a simple diagram, making it easy to see dependencies and bottlenecks
            </ListItem>
            <ListItem>Edit Workflows directly in the Pipeline</ListItem>
          </List>

          {/* Read-only views (merged config, cross-repo/ref files) can't create — show no actions. */}
          {!isReadOnlyView && (
            <Box display={['none', 'flex']} gap="24" alignItems="center">
              {actions}
            </Box>
          )}
        </Box>

        <Box p="8" maxW="436" display="flex" borderRadius="8" bg="background/secondary" alignItems="center">
          <Image src={graphPipelineImage} alt="Graph Pipeline" />
        </Box>

        {!isReadOnlyView && (
          <Box display={['flex', 'none']} flexDir="column" gap="24" alignItems="center">
            {actions}
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default CreateFirstGraphPipelineEmptyState;
