import { Dialog, DialogBody, DialogFooter, DialogProps } from '@bitrise/bitkit';
import { BitkitButton, BitkitList, IconCheck, IconCross } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';
import { useCallback } from 'react';

import StepBundleService from '@/core/services/StepBundleService';

type Props = Omit<DialogProps, 'title'> & {
  stepBundleId: string;
  onDeleteStepBundle?: () => void;
};

const DeleteStepBundleDialog = ({ stepBundleId, onDeleteStepBundle, onClose, ...dialogProps }: Props) => {
  const handleDelete = useCallback(() => {
    StepBundleService.deleteStepBundle(stepBundleId);
    onDeleteStepBundle?.();
    onClose();
  }, [stepBundleId, onDeleteStepBundle, onClose]);

  return (
    <Dialog title="Delete Step bundle?" onClose={onClose} {...dialogProps}>
      <DialogBody display="flex" flexDir="column" gap="24">
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
      </DialogBody>
      <DialogFooter data-clarity-unmask="true">
        <BitkitButton variant="secondary" onClick={onClose}>
          Cancel
        </BitkitButton>
        <BitkitButton variant="danger-primary" onClick={handleDelete}>
          Delete
        </BitkitButton>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteStepBundleDialog;
