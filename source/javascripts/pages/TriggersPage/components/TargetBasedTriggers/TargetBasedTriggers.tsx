import {
  Box,
  Checkbox,
  EmptyState,
  IconButton,
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
  useDisclosure,
} from '@bitrise/bitkit';
import { AriaAttributes, useMemo, useState } from 'react';

import AddOrEditTriggerDialog from '@/components/unified-editor/Triggers/TargetBasedTriggers/AddOrEditTriggerDialog';
import TriggerConditions from '@/components/unified-editor/Triggers/TriggerConditions';
import { trackEditTrigger, trackTriggerEnabledToggled } from '@/core/analytics/TriggerAnalytics';
import { TargetBasedTrigger, TriggerSource, TYPE_MAP } from '@/core/models/Trigger';
import TriggerService from '@/core/services/TriggerService';
import { useAllTargetBasedTriggers } from '@/hooks/useTargetBasedTriggers';

const TargetBasedTriggers = () => {
  const {
    isOpen: isEditTriggerDialogOpen,
    onOpen: openEditTriggerDialog,
    onClose: closeEditTriggerDialog,
  } = useDisclosure();
  const [editedItem, setEditedItem] = useState<TargetBasedTrigger | undefined>(undefined);

  const [filterString, setFilterString] = useState('');
  const [sortProps, setSortProps] = useState<{
    direction: AriaAttributes['aria-sort'];
    condition: 'sourceId' | 'triggerType';
  }>({
    direction: 'ascending',
    condition: 'sourceId',
  });

  const pipelineableTriggers = useAllTargetBasedTriggers();
  const filteredTriggers = useMemo(() => {
    const lowerCaseFilterString = filterString.toLowerCase();
    return pipelineableTriggers.filter((item) => {
      const matchingValues = Object.values(item).filter(
        (value) => typeof value === 'string' && value.toLowerCase().includes(lowerCaseFilterString),
      );
      return matchingValues.length > 0 || TYPE_MAP[item.triggerType].toLowerCase().includes(lowerCaseFilterString);
    });
  }, [filterString, pipelineableTriggers]);

  const sortedFilteredTriggers = useMemo(() => {
    return [...filteredTriggers].sort((a, b) => {
      const getCompareValue = (item: TargetBasedTrigger) => {
        const sourceId = item.source.split('#')[1];
        return sortProps.condition === 'sourceId' ? sourceId : item.triggerType;
      };

      const aValue = getCompareValue(a);
      const bValue = getCompareValue(b);

      const modifier = sortProps.direction === 'ascending' ? 1 : -1;
      if (aValue > bValue) {
        return modifier;
      }
      if (aValue < bValue) {
        return -modifier;
      }
      return 0;
    });
  }, [filteredTriggers, sortProps]);

  const handleOpenEditTriggerDialog = (trigger: TargetBasedTrigger) => {
    setEditedItem(trigger);
    openEditTriggerDialog();
  };

  const handleActiveChange = (trigger: TargetBasedTrigger) => {
    const updatedTrigger = { ...trigger, isActive: !trigger.isActive };
    TriggerService.updateTrigger(updatedTrigger);
    trackTriggerEnabledToggled(
      updatedTrigger,
      trigger.source.startsWith('workflows') ? 'workflow_triggers' : 'pipeline_triggers',
    );
  };

  const handleEditTrigger = (trigger: TargetBasedTrigger) => {
    TriggerService.updateTrigger(trigger);
    closeEditTriggerDialog();
    setEditedItem(undefined);
    trackEditTrigger(trigger);
  };

  const handleDeleteTrigger = (trigger: TargetBasedTrigger) => {
    TriggerService.removeTrigger(trigger);
  };

  const handleCloseEditTriggerDialog = () => {
    closeEditTriggerDialog();
    setEditedItem(undefined);
  };

  let [source, sourceId] = useMemo(() => {
    if (!editedItem) {
      return [undefined, undefined];
    }
    return editedItem.source.split('#') as [TriggerSource, string];
  }, [editedItem]);

  if (!editedItem || !source || !sourceId) {
    return null;
  }

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
                      setSortProps({ direction: sortDirection, condition: 'sourceId' });
                    }}
                    sortedBy={sortProps.condition === 'sourceId' ? sortProps.direction : undefined}
                  >
                    Target
                  </Th>
                  <Th
                    isSortable
                    onSortClick={(sortDirection) => {
                      setSortProps({ direction: sortDirection, condition: 'triggerType' });
                    }}
                    sortedBy={sortProps.condition === 'triggerType' ? sortProps.direction : undefined}
                  >
                    Type
                  </Th>
                  <Th>Conditions</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {sortedFilteredTriggers.map((trigger) => {
                  [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
                  return (
                    <Tr key={JSON.stringify(trigger)}>
                      <Td>
                        <Text>{sourceId}</Text>
                        <Text textStyle="body/md/regular" color="text/secondary">
                          {source === 'workflows' ? 'Workflow' : 'Pipeline'}
                        </Text>
                      </Td>
                      <Td>{TYPE_MAP[trigger.triggerType]}</Td>
                      <Td>
                        <TriggerConditions
                          conditions={trigger.conditions}
                          isDraftPr={trigger.isDraftPr}
                          priority={trigger.priority}
                          triggerType={trigger.triggerType}
                        />
                      </Td>
                      <Td display="flex" justifyContent="flex-end" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <Checkbox
                            marginRight="16"
                            isChecked={trigger.isActive}
                            onChange={() => handleActiveChange(trigger)}
                          >
                            Active
                          </Checkbox>
                          <IconButton
                            iconName="Pencil"
                            variant="tertiary"
                            aria-label="Edit trigger"
                            onClick={() => handleOpenEditTriggerDialog(trigger)}
                          />
                          <IconButton
                            isDanger
                            variant="tertiary"
                            iconName="MinusCircle"
                            aria-label="Delete trigger"
                            onClick={() => handleDeleteTrigger(trigger)}
                          />
                        </Box>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
          <AddOrEditTriggerDialog
            source={source}
            sourceId={sourceId}
            editedItem={editedItem}
            triggerType={editedItem.triggerType}
            currentTriggers={pipelineableTriggers}
            onSubmit={handleEditTrigger}
            onCancel={handleCloseEditTriggerDialog}
            isOpen={isEditTriggerDialogOpen}
            variant="target-based"
          />
        </>
      ) : (
        <EmptyState
          iconName="Trigger"
          title="An overview of your triggers will appear here"
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

export default TargetBasedTriggers;
