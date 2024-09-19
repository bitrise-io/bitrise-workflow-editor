import { useState } from 'react';
import {
  ControlButton,
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
} from '@bitrise/bitkit';
import { PipelineableTriggerItem } from './TriggersPage.utils';

type SelectiveTriggersProps = {
  pipelineableTriggers: PipelineableTriggerItem[];
};

const SelectiveTriggers = (props: SelectiveTriggersProps) => {
  const { pipelineableTriggers } = props;
  const [filterString, setFilterString] = useState('');

  const TYPE_MAP: Record<PipelineableTriggerItem['type'], string> = {
    push: 'Push',
    pull_request: 'Pull request',
    tag: 'Tag',
  };

  const filteredItems = pipelineableTriggers.filter((item) => {
    const lowerCaseFilterString = filterString.toLowerCase();
    const matchingValues = Object.values(item).filter((value) => {
      if (typeof value === 'string' && value.toLowerCase().includes(lowerCaseFilterString)) {
        return true;
      }
      return false;
    });
    return matchingValues.length > 0 || TYPE_MAP[item.type].toLowerCase().includes(lowerCaseFilterString);
  });

  return pipelineableTriggers.length > 0 ? (
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
      <SearchInput
        onChange={setFilterString}
        value={filterString}
        maxWidth="320"
        marginBlockEnd="16"
        placeholder="Filter by target, type or condition"
      />
      <TableContainer marginBlockEnd="32">
        <Table>
          <Thead>
            <Tr>
              <Th isSortable={pipelineableTriggers.length > 1} onSortClick={() => {}} sortedBy="ascending">
                Target
              </Th>
              <Th isSortable={pipelineableTriggers.length > 1}>Type</Th>
              <Th isSortable>Conditions</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {filteredItems.map((trigger) => {
              return (
                <Tr key={JSON.stringify(trigger)}>
                  <Td>
                    <Text>{trigger.id}</Text>
                    <Text textStyle="body/md/regular" color="text/secondary">
                      {trigger.pipelineableType === 'workflow' && 'Workflow'}
                      {trigger.pipelineableType === 'pipeline' && 'Pipeline'}
                    </Text>
                  </Td>
                  <Td>{TYPE_MAP[trigger.type]}</Td>
                  <Td>
                    {/* {' '}
                      <Box display="flex" alignItems="center" flexWrap="wrap" rowGap="8" columnGap="4">
                        {(!conditions || conditions.length === 0) && <Tag size="sm">No conditions.</Tag>}
                        {conditions.map(({ type, value }, index) => (
                          <Fragment key={type + value}>
                            <Tooltip label={toolTip[type]}>
                              <Tag iconName={iconMap[type]} iconColor="neutral.60" size="sm">
                                {value}
                              </Tag>
                            </Tooltip>
                            {conditions.length - 1 > index && <Text as="span">+</Text>}
                          </Fragment>
                        ))}
                      </Box> */}
                  </Td>
                  <Td display="flex" justifyContent="flex-end" alignItems="center">
                    {trigger.pipelineableType === 'workflow' && (
                      <ControlButton aria-label="Edit trigger" iconName="Settings" onClick={() => {}} />
                    )}
                    {trigger.pipelineableType === 'pipeline' && (
                      <ControlButton aria-label="Edit in YAML" iconName="Code" onClick={() => {}} />
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  ) : (
    <EmptyState
      iconName="Trigger"
      title="An overview of your target based triggers will appear here"
      maxHeight="208"
      marginBlockEnd="24"
    >
      <Text marginBlockStart="8">
        Start configuring triggers directly in your Workflow or Pipeline settings. With this method, a single Git event
        can execute multiple Workflows or Pipelines.{' '}
        <Link
          colorScheme="purple"
          href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
        >
          Learn more
        </Link>
      </Text>
    </EmptyState>
  );
};

export default SelectiveTriggers;
