import {
  EmptyState,
  Link,
  SearchInput,
  TableContainer,
  Td,
  Text,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  IconButton,
} from '@bitrise/bitkit';

type SelectiveTriggersProps = {
  workflowId?: string;
  pipelines?: string;
  gitEvents: {
    push: { branch: string; enabled: boolean }[];
    tag: { tagRegex: string }[];
    pull_request: ({ pullRequestComment: string } | { commitMessageRegex: string })[];
  };
};

const SelectiveTriggers = (props: SelectiveTriggersProps) => {
  const { gitEvents, workflowId, pipelines } = props;

  //   const hasNoTriggers =
  //     gitEvents.push.length === 0 && gitEvents.pull_request.length === 0 && gitEvents.tag.length === 0;

  return (
    <>
      <Text as="h2" textStyle="heading/h2" marginBlockEnd="4">
        Triggers
      </Text>
      <Text color="text/secondary" marginBlockEnd="32">
        Triggers help you start builds automatically.{' '}
        <Link
          colorScheme="purple"
          href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
          isExternal
        >
          Learn more
        </Link>
      </Text>
      <EmptyState
        iconName="Trigger"
        title="An overview of your target based triggers will appear here"
        maxHeight="208"
        marginBlockEnd="24"
      >
        <Text marginBlockStart="8">
          Start configuring triggers directly in your Workflow or Pipeline settings. With this method, a single Git
          event can execute multiple Workflows or Pipelines.{' '}
          <Link
            colorScheme="purple"
            href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
          >
            Learn more
          </Link>
        </Text>
      </EmptyState>
      <SearchInput
        onChange={() => {}}
        maxWidth="320"
        marginBlockEnd="16"
        placeholder="Filter by target, type or condition"
      />
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Target</Th>
              <Th>Type</Th>
              <Th>Conditions</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <Text>A</Text>
                <Text textStyle="body/md/regular" color="text/secondary">
                  {workflowId ? 'Workflow' : 'Pipeline'}
                </Text>
              </Td>
              <Td>B</Td>
              <Td>C</Td>
              <Td>
                {workflowId && (
                  <IconButton
                    aria-label="Edit trigger"
                    iconName="Settings"
                    size="sm"
                    variant="secondary"
                    onClick={() => {}}
                  />
                )}
                {pipelines && (
                  <IconButton
                    aria-label="Edit in YAML"
                    iconName="Code"
                    size="sm"
                    variant="secondary"
                    onClick={() => {}}
                  />
                )}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SelectiveTriggers;
