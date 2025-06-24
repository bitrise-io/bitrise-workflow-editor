import { Dialog, DialogBody } from '@bitrise/bitkit';

import AddOrEditTargetBasedTrigger from '@/components/unified-editor/Triggers/TargetBasedTriggers/AddOrEditTargetBasedTrigger';
import { TargetBasedTrigger, TriggerSource, TriggerType } from '@/core/models/Trigger';

type AddTriggerDialogProps = {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (trigger: TargetBasedTrigger) => void;
  triggerType: TriggerType;
  currentTriggers: TargetBasedTrigger[];
  source: TriggerSource;
  sourceId: string;
  editedItem?: TargetBasedTrigger;
};

const AddTriggerDialog = (props: AddTriggerDialogProps) => {
  const { isOpen, onCancel, triggerType, currentTriggers, source, sourceId, onSubmit, editedItem } = props;

  const title = editedItem
    ? `Edit ${triggerType.replace('_', ' ')} trigger`
    : `Add ${triggerType.replace('_', ' ')} trigger`;

  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title={title} maxWidth="640">
      <DialogBody>
        <AddOrEditTargetBasedTrigger
          source={source}
          sourceId={sourceId}
          triggerType={triggerType}
          currentTriggers={currentTriggers}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </DialogBody>
    </Dialog>
  );
};

export default AddTriggerDialog;
