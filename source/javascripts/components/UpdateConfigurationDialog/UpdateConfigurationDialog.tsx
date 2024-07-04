import { Box, Button, Dialog, DialogBody, DialogFooter, Text } from '@bitrise/bitkit';

type UpdateConfigurationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const UpdateConfigurationDialog = (props: UpdateConfigurationDialogProps) => {
  const { isOpen, onClose } = props;
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Update configuration YAML">
      <DialogBody>
        <Text marginBlockEnd="24">
          If you would like to apply these changes to your configuration, depending on your setup, you need to do the
          following:
        </Text>
        <Text textStyle="heading/h4" marginBlockEnd="4">
          Using a single configuration file
        </Text>
        <Text marginBlockEnd="16">
          Update the content of the configuration YAML in the REPONAME repository’s BRANCHNAME branch.
        </Text>
        <Box display="flex" flexDir="column" gap="8" marginBlockEnd="24">
          <Button variant="tertiary" width="fit-content" size="sm" leftIconName="Download">
            Download changed version
          </Button>
          <Button variant="tertiary" width="fit-content" size="sm" leftIconName="Duplicate">
            Copy changed configuration
          </Button>
        </Box>
        <Text textStyle="heading/h4" marginBlockEnd="4">
          Using multiple configuration files
        </Text>
        <Text>You need to re-create the changes in the relevant configuration file on your Git repository.</Text>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button>Done</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default UpdateConfigurationDialog;
