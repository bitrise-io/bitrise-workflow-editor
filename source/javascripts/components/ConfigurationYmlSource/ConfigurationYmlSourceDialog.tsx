import { Button, Dialog, DialogBody, DialogFooter, Radio, RadioGroup, Text } from '@bitrise/bitkit';
import { Controller, useForm } from 'react-hook-form';

type ConfigurationYmlSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ConfigurationYmlSourceDialog = (props: ConfigurationYmlSourceDialogProps) => {
  const { isOpen, onClose } = props;
  const { control } = useForm();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Configuration YAML source">
      <DialogBody>
        <Text textStyle="body/md/semibold" marginBlockEnd="12">
          Source
        </Text>
        <Controller
          control={control}
          name="source"
          render={({ field: { ...rest } }) => {
            return (
              <RadioGroup {...rest}>
                <Radio
                  helperText="Store and manage all your configuration on bitrise.io."
                  marginBlockEnd="12"
                  value="bitrise"
                >
                  bitrise.io
                </Radio>
                <Radio
                  helperText="The configuration is stored, versioned, and maintained in your Git repository."
                  value="git"
                >
                  Git repository
                </Radio>
              </RadioGroup>
            );
          }}
        />
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
