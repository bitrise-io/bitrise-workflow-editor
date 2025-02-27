import { Box, Button, Card, Icon, Image, Link, List, ListItem, Text } from '@bitrise/bitkit';

import graphPipelineImage from '../../assets/graph-pipeline.png';

type Props = {
  onCreate: VoidFunction;
};

const CreateFirstGraphPipelineEmptyState = ({ onCreate }: Props) => {
  return (
    <Box px="24" display="flex" flex="1" justifyContent="center" alignItems="center" bg="background/secondary">
      <Card p="24" maxW="920" display="flex" gap="32" variant="outline">
        <Box flex="1">
          <Text as="h3" textStyle="heading/h3" mb="16">
            Get started with Pipelines
          </Text>

          <List variant="unordered" pl="8" textStyle="body/md/regular" mb="32">
            <ListItem>Parallelize tasks for faster build cycles</ListItem>
            <ListItem>
              Every Pipeline run is visualized in a simple diagram, making it easy to see dependencies and bottlenecks
            </ListItem>
            <ListItem>Edit Workflows directly in the Pipeline</ListItem>
          </List>

          <Box display="flex" gap="24" alignItems="center">
            <Button leftIconName="Plus" size="md" onClick={onCreate}>
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
          </Box>
        </Box>
        <Box
          p="16"
          flex="1"
          display="flex"
          borderRadius="8"
          alignItems="center"
          justifyContent="center"
          bg="background/secondary"
        >
          <Image src={graphPipelineImage} alt="Graph Pipeline" />
        </Box>
      </Card>
    </Box>
  );
};

export default CreateFirstGraphPipelineEmptyState;
