import { Box, Card, Toggle } from '@bitrise/bitkit';
import { useState } from 'react';

import { trackTargetBasedTriggersEnabledToggled, trackTriggerEnabledToggled } from '@/core/analytics/TriggerAnalytics';
import { TargetBasedTrigger, TriggerSource, TriggerType } from '@/core/models/Trigger';
import TriggerService from '@/core/services/TriggerService';
import useTargetBasedTriggers from '@/hooks/useTargetBasedTriggers';

import AddOrEditTargetBasedTrigger from './AddOrEditTargetBasedTrigger';
import TargetBasedTriggerNotification from './TargetBasedTriggerNotification';
import TargetBasedTriggersCard from './TargetBasedTriggersCard';

type Props = {
  source: TriggerSource;
  sourceId: string;
};

const TargetBasedTriggersTabContent = (props: Props) => {
  const { source, sourceId } = props;

  const triggers = useTargetBasedTriggers(source, sourceId);
  const [triggerType, setTriggerType] = useState<TriggerType | undefined>(undefined);
  const [editedItem, setEditedItem] = useState<{ index: number; trigger: TargetBasedTrigger } | undefined>(undefined);

  const changeToEditMode = (trigger: TargetBasedTrigger) => {
    setEditedItem({ trigger, index: trigger.index });
    setTriggerType(trigger.triggerType);
  };

  const handleDeleteTrigger = (trigger: TargetBasedTrigger) => {
    TriggerService.removeTrigger(trigger);
  };

  const handleTriggerEnabledToggled = (trigger: TargetBasedTrigger) => {
    TriggerService.updateTriggerEnabled(trigger);
    trackTriggerEnabledToggled(trigger, source === 'pipelines' ? 'pipeline_triggers' : 'workflow_triggers');
  };

  const onSubmit = (trigger: TargetBasedTrigger) => {
    if (editedItem) {
      TriggerService.updateTrigger(trigger);
    } else {
      TriggerService.addTrigger(trigger);
    }
    setTriggerType(undefined);
    setEditedItem(undefined);
  };

  const handleGlobalTriggerEnabledToggled = () => {
    const newEnabledState = triggers.enabled === undefined ? false : !triggers.enabled;
    TriggerService.updateEnabled(newEnabledState, { source, sourceId });
    trackTargetBasedTriggersEnabledToggled(source, sourceId, newEnabledState);
  };

  return (
    <>
      {triggerType !== undefined && (
        <AddOrEditTargetBasedTrigger
          source={source}
          sourceId={sourceId}
          triggerType={triggerType}
          editedItem={editedItem?.trigger}
          currentTriggers={triggers.items[triggerType] || []}
          onSubmit={onSubmit}
          onCancel={() => {
            setTriggerType(undefined);
            setEditedItem(undefined);
          }}
          isOpen
        />
      )}
      <Box display={triggerType !== undefined ? 'none' : 'block'}>
        <TargetBasedTriggerNotification />
        <Card paddingY="16" paddingX="24" marginBlockEnd="24" variant="outline">
          <Toggle
            variant="fixed"
            label="Enable triggers"
            helperText="When disabled and saved, none of the triggers below will execute a build."
            isChecked={triggers.enabled !== false}
            onChange={() => {
              handleGlobalTriggerEnabledToggled();
            }}
          />
        </Card>
        <TargetBasedTriggersCard
          triggerType="push"
          triggers={triggers.items.push}
          triggersEnabled={triggers.enabled !== false}
          onAddTrigger={setTriggerType}
          onEditTrigger={changeToEditMode}
          onDeleteTrigger={handleDeleteTrigger}
          onUpdateTriggerEnabled={handleTriggerEnabledToggled}
        />
        <TargetBasedTriggersCard
          triggerType="pull_request"
          triggers={triggers.items.pull_request}
          triggersEnabled={triggers.enabled !== false}
          onAddTrigger={setTriggerType}
          onEditTrigger={changeToEditMode}
          onDeleteTrigger={handleDeleteTrigger}
          onUpdateTriggerEnabled={handleTriggerEnabledToggled}
        />
        <TargetBasedTriggersCard
          triggerType="tag"
          triggers={triggers.items.tag}
          triggersEnabled={triggers.enabled !== false}
          onAddTrigger={setTriggerType}
          onEditTrigger={changeToEditMode}
          onDeleteTrigger={handleDeleteTrigger}
          onUpdateTriggerEnabled={handleTriggerEnabledToggled}
        />
      </Box>
    </>
  );
};

export default TargetBasedTriggersTabContent;
