import { Button, Dialog, DialogBody, DialogFooter, Divider, Radio, RadioGroup, Text } from '@bitrise/bitkit';

type ConfigurationYmlSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ConfigurationYmlSourceDialog = (props: ConfigurationYmlSourceDialogProps) => {
  const { isOpen, onClose } = props;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Configuration YAML source">
      <DialogBody>
        <Text textStyle="body/md/semibold" marginBlockEnd="12">
          Source
        </Text>
        <RadioGroup>
          <Radio
            helperText="Store and manage all your configuration on bitrise.io."
            marginBlockEnd="12"
            value="bitrise"
          >
            bitrise.io
          </Radio>
          <Radio
            helperText="The configuration is stored, versioned, and maintained in your Git repository."
            marginBlockEnd="24"
            value="git"
          >
            Git repository
          </Radio>
        </RadioGroup>

        {/*  (
          <Notification status="progress">Looking for a configuration file in the app’s repository.</Notification>
        ) */}
        <Divider marginY="24" />
        <Text textStyle="heading/h3" marginBlockEnd="4">
          Set configuration file
        </Text>
        <Text marginBlockEnd="24">Choose which configuration file should be used on bitrise.io from now.</Text>
        <RadioGroup>
          <Radio
            helperText="Multiple configuration files will be merged into a single file. Learn more"
            marginBlockEnd="12"
            value="git"
          >
            Use the configuration file stored in the Git repository
          </Radio>
          <Radio helperText="Last updated: May 12, 2024" value="bitrise">
            Use the last version you stored on bitrise.io
          </Radio>
        </RadioGroup>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button>Validate and save</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfigurationYmlSourceDialog;
