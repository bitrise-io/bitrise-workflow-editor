import {
  BitkitButton,
  BitkitHeading,
  BitkitLink,
  BitkitList,
  IconArrowNortheast,
  IconPlus,
  IconSparkleFilled,
  rem,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ButtonGroup } from '@chakra-ui/react/button';
import { Card } from '@chakra-ui/react/card';
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
    <Box display="flex" flexDirection={isAIButtonVisible ? 'column' : 'row'} alignItems="center" gap="24">
      <ButtonGroup gap="24">
        {isAIButtonVisible && (
          <BitkitButton
            state={isAIButtonDisabled ? 'disabled' : undefined}
            disabledReason={tooltipLabel}
            icon={IconSparkleFilled}
            size="md"
            variant="ai-primary"
            onClick={onAIButtonClick}
          >
            Create Pipeline with AI
          </BitkitButton>
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
      padding="24"
      flex="1"
      display="flex"
      justifyContent="center"
      alignItems={['flex-start', 'center']}
      background="background/secondary"
    >
      <Card.Root elevation={false} data-clarity-unmask="true">
        <Card.Body display="flex" flexDirection={['column', 'row']} gap="32">
          <Box maxWidth={rem(420)} display="flex" flexDirection="column" gap="16">
            <BitkitHeading as="h3">Get started with Pipelines</BitkitHeading>

            <BitkitList flex="1" size="md">
              <BitkitList.Item>Parallelize tasks for faster build cycles</BitkitList.Item>
              <BitkitList.Item>
                Every Pipeline run is visualized in a simple diagram, making it easy to see dependencies and bottlenecks
              </BitkitList.Item>
              <BitkitList.Item>Edit Workflows directly in the Pipeline</BitkitList.Item>
            </BitkitList>

            {/* Read-only views (merged config, cross-repo/ref files) can't create — show no actions. */}
            {!isReadOnlyView && (
              <Box display={['none', 'flex']} gap="24" alignItems="center">
                {actions}
              </Box>
            )}
          </Box>

          <Box
            padding="8"
            maxWidth={rem(436)}
            display="flex"
            borderRadius="8"
            background="background/secondary"
            alignItems="center"
          >
            <Image src={graphPipelineImage} alt="Graph Pipeline" />
          </Box>

          {!isReadOnlyView && (
            <Box display={['flex', 'none']} flexDirection="column" gap="24" alignItems="center">
              {actions}
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default CreateFirstGraphPipelineEmptyState;
