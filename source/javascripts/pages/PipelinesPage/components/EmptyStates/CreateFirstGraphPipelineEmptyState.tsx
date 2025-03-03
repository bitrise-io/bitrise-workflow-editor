import { Box, Button, Card, Icon, Image, Link, List, ListItem, Text } from '@bitrise/bitkit';

import graphPipelineImage from '../../assets/graph-pipeline.png';

type Props = {
  onCreate: VoidFunction;
};

const CreateFirstGraphPipelineEmptyState = ({ onCreate }: Props) => {
  const actions = (
    <>
      <Button alignSelf={['stretch', 'center']} leftIconName="Plus" size="md" onClick={onCreate}>
        Create Pipeline
      </Button>
      <Link
        isExternal
        colorScheme="purple"
        textStyle="body/md/regular"
        href="https://devcenter.bitrise.io/en/steps-and-workflows/build-pipelines.html"
      >
        Read the docs
        <Icon size="16" name="ArrowNorthEast" ml="4" />
      </Link>
    </>
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
      <Card p="24" display="flex" flexDir={['column', 'row']} gap="32" variant="outline" width="auto">
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

          <Box display={['none', 'flex']} gap="24" alignItems="center">
            {actions}
          </Box>
        </Box>

        <Box p="8" maxW="436" display="flex" borderRadius="8" bg="background/secondary" alignItems="center">
          <Image src={graphPipelineImage} alt="Graph Pipeline" />
        </Box>

        <Box display={['flex', 'none']} flexDir="column" gap="24" alignItems="center">
          {actions}
        </Box>
      </Card>
    </Box>
  );
};

export default CreateFirstGraphPipelineEmptyState;
