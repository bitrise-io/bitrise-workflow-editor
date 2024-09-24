import { AriaAttributes, useState } from 'react';
import {
  ControlButton,
  EmptyState,
  Link,
  SearchInput,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@bitrise/bitkit';
import { BitriseYml } from '@/core/models/BitriseYml';
import useNavigation from '@/hooks/useNavigation';
import { getConditionList, getPipelineableTriggers } from '../TriggersPage/TriggersPage.utils';
import { TriggerType } from '../TriggersPage/TriggersPage.types';
import TriggerConditions from './TriggerConditions';

const TYPE_MAP: Record<TriggerType, string> = {
  push: 'Push',
  pull_request: 'Pull request',
  tag: 'Tag',
};

type SelectiveTriggersProps = {
  yml: BitriseYml;
};

const SelectiveTriggers = (props: SelectiveTriggersProps) => {
  const { yml } = props;

  const { replace } = useNavigation();

  const [filterString, setFilterString] = useState('');
  const [sortProps, setSortProps] = useState<{
    direction: AriaAttributes['aria-sort'];
    condition: 'pipelineableId' | 'type';
  }>({
    direction: 'ascending',
    condition: 'pipelineableId',
  });

  const pipelineableTriggers = getPipelineableTriggers(yml);

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

  filteredItems.sort((a, b) => {
    if (a[sortProps.condition] > b[sortProps.condition]) {
      return sortProps.direction === 'ascending' ? 1 : -1;
    }
    if (a[sortProps.condition] < b[sortProps.condition]) {
      return sortProps.direction === 'ascending' ? -1 : 1;
    }
    return 0;
  });

  console.log(pipelineableTriggers);

  return (
    <>
      {pipelineableTriggers.length > 0 ? (
        <>
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
                  <Th
                    isSortable
                    onSortClick={(sortDirection) => {
                      setSortProps({ direction: sortDirection, condition: 'pipelineableId' });
                    }}
                    sortedBy={sortProps.condition === 'pipelineableId' ? sortProps.direction : undefined}
                  >
                    Target
                  </Th>
                  <Th
                    isSortable
                    onSortClick={(sortDirection) => {
                      setSortProps({ direction: sortDirection, condition: 'type' });
                    }}
                    sortedBy={sortProps.condition === 'type' ? sortProps.direction : undefined}
                  >
                    Type
                  </Th>
                  <Th>Conditions</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {filteredItems.map((trigger) => (
                  <Tr key={JSON.stringify(trigger)}>
                    <Td>
                      <Text>{trigger.pipelineableId}</Text>
                      <Text textStyle="body/md/regular" color="text/secondary">
                        {trigger.pipelineableType === 'workflow' ? 'Workflow' : 'Pipeline'}
                      </Text>
                    </Td>
                    <Td>{TYPE_MAP[trigger.type]}</Td>
                    <Td>
                      <TriggerConditions conditions={getConditionList(trigger)} isDraftPr={trigger.draft_enabled} />
                    </Td>
                    <Td display="flex" justifyContent="flex-end" alignItems="center">
                      {trigger.pipelineableType === 'workflow' && (
                        <ControlButton
                          aria-label="Edit trigger"
                          iconName="Settings"
                          onClick={() => replace('/workflows')}
                        />
                      )}
                      {trigger.pipelineableType === 'pipeline' && (
                        <ControlButton aria-label="Edit in YAML" iconName="Code" onClick={() => replace('/yml')} />
                      )}
                    </Td>
                  </Tr>
                ))}
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
      )}
    </>
  );
};

export default SelectiveTriggers;
