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
} from '@bitrise/bitkit';
import { AriaAttributes, useMemo, useState } from 'react';

import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import AddOrEditTriggerDialog from '@/components/unified-editor/Triggers/TargetBasedTriggers/AddOrEditTriggerDialog';
import TriggerConditions from '@/components/unified-editor/Triggers/TriggerConditions';
import { trackEditTrigger, trackTriggerEnabledToggled } from '@/core/analytics/TriggerAnalytics';
import { TargetBasedTrigger, TriggerSource, TriggerType, TYPE_MAP } from '@/core/models/Trigger';
import TriggerService from '@/core/services/TriggerService';
import {
  useAllTargetBasedTriggers,
  useTriggerDefiningNodeIds,
  useTriggersGroupedByFile,
} from '@/hooks/useTargetBasedTriggers';
import { useIsMergedConfigSelected, useIsReadOnlyView } from '@/hooks/useTree';

import AddTriggerButton from './AddTriggerButton';

const TargetBasedTriggers = () => {
  const isReadOnlyView = useIsReadOnlyView();
  const isMergedView = useIsMergedConfigSelected();
  const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
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

  // Merged (read-only) view: group by the source file of each trigger's target.
  // Only group on the merged tab; elsewhere there's nothing to group, so skip the work entirely.
  const fileGroups = useTriggersGroupedByFile(isMergedView ? sortedFilteredTriggers : []);
  // The files that actually carry a trigger for each target — so the jump-to-definition lists only
  // the modules where a trigger really lives, not every module that defines the workflow/pipeline.
  // Only the merged view renders the jump, so skip the per-file scan otherwise.
  const triggerNodesBySource = useTriggerDefiningNodeIds(isMergedView);

  const handleOpenDialog = (trigger: TargetBasedTrigger) => {
    setEditedItem(trigger);
    setTriggerType(trigger.triggerType);
  };

  const handleCancel = () => {
    setTriggerType(null);
    setEditedItem(undefined);
  };

  const handleActiveChange = (trigger: TargetBasedTrigger) => {
    const updatedTrigger = { ...trigger, isActive: !trigger.isActive };
    TriggerService.updateTrigger(updatedTrigger);
    trackTriggerEnabledToggled(
      updatedTrigger,
      trigger.source.startsWith('workflows') ? 'workflow_triggers' : 'pipeline_triggers',
    );
  };

  const onSubmit = (trigger: TargetBasedTrigger) => {
    if (editedItem) {
      TriggerService.updateTrigger(trigger, editedItem);
      setEditedItem(undefined);
      trackEditTrigger(trigger);
    } else {
      TriggerService.addTrigger(trigger);
    }
    setTriggerType(null);
  };

  const handleDeleteTrigger = (trigger: TargetBasedTrigger) => {
    TriggerService.removeTrigger(trigger);
  };

  const renderRow = (trigger: TargetBasedTrigger, useJump: boolean) => {
    const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
    return (
      <Tr key={trigger.uniqueId}>
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
            triggerDisabled={!trigger.isActive || !trigger.isTriggersModelActive}
          />
        </Td>
        <Td display="flex" justifyContent="flex-end" alignItems="center">
          <Box display="flex" alignItems="center">
            <Checkbox
              marginRight="16"
              isChecked={trigger.isActive}
              isDisabled={isReadOnlyView}
              onChange={() => handleActiveChange(trigger)}
            >
              Active
            </Checkbox>
            {isReadOnlyView ? (
              // Read-only (merged/ghost): no edit/delete CTAs (BIVS-3721). When the target is grouped,
              // collapse to a jump-to-definition arrow over the modules that actually carry a trigger;
              // otherwise show nothing.
              useJump && (
                <CrossFileJumpButton kind={source} id={sourceId} nodeIds={triggerNodesBySource.get(trigger.source)} />
              )
            ) : (
              <>
                <IconButton
                  iconName="Pencil"
                  variant="tertiary"
                  aria-label="Edit trigger"
                  onClick={() => handleOpenDialog(trigger)}
                />
                <IconButton
                  isDanger
                  variant="tertiary"
                  iconName="MinusCircle"
                  aria-label="Delete trigger"
                  onClick={() => handleDeleteTrigger(trigger)}
                />
              </>
            )}
          </Box>
        </Td>
      </Tr>
    );
  };

  const renderTable = (triggers: TargetBasedTrigger[], useJump: boolean) => (
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
        <Tbody>{triggers.map((trigger) => renderRow(trigger, useJump))}</Tbody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      {pipelineableTriggers.length > 0 ? (
        <>
          <Box display="flex" justifyContent="space-between">
            <SearchInput
              onChange={setFilterString}
              value={filterString}
              maxWidth="320"
              width="100%"
              size="md"
              marginBlockEnd="16"
              placeholder="Filter by target, type or condition"
            />
            <AddTriggerButton onAddTrigger={setTriggerType} />
          </Box>
          {isMergedView && fileGroups.length > 0
            ? fileGroups.map((group) => (
                <Box key={group.nodeId}>
                  <Text as="h3" textStyle="heading/h4" marginBlockEnd="12">
                    {group.path}
                  </Text>
                  {renderTable(group.triggers, true)}
                </Box>
              ))
            : renderTable(sortedFilteredTriggers, false)}
        </>
      ) : (
        <EmptyState
          iconName="Trigger"
          title="Target based triggers will appear here"
          maxHeight="208"
          marginBlockEnd="24"
        >
          <Text marginBlockStart="8" marginBlockEnd="24">
            Target-based triggers let you run multiple Workflows or Pipelines from a single Git event. You can set them
            up here or directly in the Workflow or Pipeline settings.{' '}
            <Link
              colorScheme="purple"
              href="https://docs.bitrise.io/en/bitrise-ci/run-and-analyze-builds/starting-builds/triggering-builds-automatically.html"
            >
              Learn more
            </Link>
          </Text>
          <AddTriggerButton onAddTrigger={setTriggerType} />
        </EmptyState>
      )}
      {triggerType && (
        <AddOrEditTriggerDialog
          source={editedItem ? (editedItem.source.split('#')[0] as TriggerSource) : ''}
          sourceId={editedItem ? editedItem.source.split('#')[1] : ''}
          editedItem={editedItem}
          triggerType={triggerType}
          currentTriggers={pipelineableTriggers}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          isOpen={!!triggerType}
          variant="target-based"
          showTarget
        />
      )}
    </>
  );
};

export default TargetBasedTriggers;
