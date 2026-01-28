import { Box, Button, Dialog, DialogBody, DialogFooter, DialogProps, Icon, Text } from '@bitrise/bitkit';

const DeleteContainerDialog = (props: Omit<DialogProps, 'title'>) => {
  const { isOpen, onClose } = props;
  return (
    <Dialog title="Delete container?" isOpen={isOpen} onClose={onClose}>
      <DialogBody>
        <Text mb="24">
          Are you sure you want to delete{' '}
          <Text as="span" textStyle="body/lg/semibold">
            node?
          </Text>
        </Text>
        <Box display="flex" alignItems="center" gap="8" mb="8">
          <Icon name="Cross" color="icon/negative" />
          <Text>All settings of this container will be deleted.</Text>
        </Box>
        <Box display="flex" alignItems="center" gap="8" mb="24">
          <Icon name="Cross" color="icon/negative" />
          <Text>All container usage will be deleted from the following Workflows:</Text>
        </Box>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger-primary">Delete</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteContainerDialog;
