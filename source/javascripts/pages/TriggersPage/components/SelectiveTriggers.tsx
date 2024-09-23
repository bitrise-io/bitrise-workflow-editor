import { AriaAttributes, useState } from 'react';
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
import { isObject } from 'lodash';
import useNavigation from '../../../hooks/useNavigation';
import { PipelineableTriggerItem } from '../TriggersPage.utils';
import { Condition, ConditionType } from '../TriggersPage.types';
import TriggerConditions from './TriggerConditions';

type SelectiveTriggersProps = {
  pipelineableTriggers: PipelineableTriggerItem[];
};

const SelectiveTriggers = (props: SelectiveTriggersProps) => {
  const { pipelineableTriggers } = props;

  const [filterString, setFilterString] = useState('');
  const [sortProps, setSortProps] = useState<{ direction: AriaAttributes['aria-sort']; condition: 'id' | 'type' }>({
    direction: 'ascending',
    condition: 'id',
  });
  const { replace } = useNavigation();

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

  filteredItems.sort((a, b) => {
    if (a[sortProps.condition] > b[sortProps.condition]) {
      return sortProps.direction === 'ascending' ? 1 : -1;
    }
    if (a[sortProps.condition] < b[sortProps.condition]) {
      return sortProps.direction === 'ascending' ? -1 : 1;
    }
    return 0;
  });

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
                      setSortProps({ direction: sortDirection, condition: 'id' });
                    }}
                    sortedBy={sortProps.condition === 'id' ? sortProps.direction : undefined}
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
                {filteredItems.map((trigger) => {
                  // TODO kozos utilba
                  const conditions: Condition[] = [];
                  const triggerKeys = Object.keys(trigger) as (keyof PipelineableTriggerItem)[];
                  triggerKeys.forEach((key) => {
                    if (!['enabled', 'id', 'pipelineableType', 'type', 'draft_enabled'].includes(key)) {
                      const isRegex = isObject(trigger[key]);
                      conditions.push({
                        isRegex,
                        type: key as ConditionType,
                        value: isRegex ? (trigger[key] as any).regex : (trigger[key] as string),
                      });
                    }
                  });
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
                        <TriggerConditions
                          conditions={conditions}
                          isDraftPr={trigger.type === 'pull_request' && trigger.draft_enabled}
                        />
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
