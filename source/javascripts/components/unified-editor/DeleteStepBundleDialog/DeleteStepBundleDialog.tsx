import { BitkitButton, BitkitDialog, BitkitList, IconCheck, IconCross } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { useCallback } from 'react';

import StepBundleService from '@/core/services/StepBundleService';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  stepBundleId: string;
  onDeleteStepBundle?: () => void;
};

const DeleteStepBundleDialog = ({ isOpen, stepBundleId, onDeleteStepBundle, onClose }: Props) => {
  const handleDelete = useCallback(() => {
    StepBundleService.deleteStepBundle(stepBundleId);
    onDeleteStepBundle?.();
    onClose();
  }, [stepBundleId, onDeleteStepBundle, onClose]);

  return (
    <BitkitDialog
      title="Delete Step bundle?"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      footerButtons={
        <>
          <BitkitButton variant="secondary" onClick={onClose} data-clarity-unmask="true">
            Cancel
          </BitkitButton>
          <BitkitButton variant="danger-primary" onClick={handleDelete} data-clarity-unmask="true">
            Delete
          </BitkitButton>
        </>
      }
    >
      <Text>
        Are you sure you want to delete <strong>{stepBundleId}</strong>?
      </Text>
      <BitkitList data-clarity-unmask="true">
        <BitkitList.Item icon={IconCross} iconColor="icon/negative">
          All settings of this Step bundle will be deleted.
        </BitkitList.Item>
        <BitkitList.Item icon={IconCross} iconColor="icon/negative">
          Dependent automated tasks, builds and deployments will stop functioning.
        </BitkitList.Item>
        <BitkitList.Item icon={IconCheck} iconColor="icon/positive">
          Historical build logs will remain accessible.
        </BitkitList.Item>
      </BitkitList>
    </BitkitDialog>
  );
};

export default DeleteStepBundleDialog;
