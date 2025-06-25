import { useMemo } from 'react';

import AddOrEditTriggerDialog from '@/components/unified-editor/Triggers/TargetBasedTriggers/AddOrEditTriggerDialog';
import { TargetBasedTrigger, TriggerSource } from '@/core/models/Trigger';

type Props = {
  isOpen: boolean;
  editedItem?: TargetBasedTrigger;
  currentTriggers: TargetBasedTrigger[];
  onEdit: (trigger: TargetBasedTrigger) => void;
  onClose: () => void;
};

const EditTargetBasedTriggerDialog = ({ isOpen, editedItem, currentTriggers, onEdit, onClose }: Props) => {
  const [source, sourceId] = useMemo(() => {
    if (!editedItem) {
      return [undefined, undefined];
    }
    return editedItem.source.split('#') as [TriggerSource, string];
  }, [editedItem]);

  const handleEdit = (trigger: TargetBasedTrigger) => {
    onEdit(trigger);
    onClose();
  };

  if (!editedItem || !source || !sourceId) {
    return null;
  }

  return (
    <AddOrEditTriggerDialog
      source={source}
      sourceId={sourceId}
      editedItem={editedItem}
      triggerType={editedItem.triggerType}
      currentTriggers={currentTriggers}
      onSubmit={handleEdit}
      onCancel={onClose}
      isOpen={isOpen}
      variant="legacy"
    />
  );
};

export default EditTargetBasedTriggerDialog;
