import React from 'react';
import { Box, Button, ButtonGroup, Dialog, DialogBody, DialogFooter, Icon, Text } from '@bitrise/bitkit';

type Props = {
  visible: boolean;
  onContinue(): void;
  onCancel(): void;
};

const ConfirmSwitchToRepositoryYml: React.FC<Props> = ({ visible, onContinue, onCancel }: Props) => (
  <Dialog width="640px" isOpen={visible} title="Make sure your bitrise.yml file is valid!" onClose={onCancel}>
    <DialogBody>
      <Box display="flex" flexDirection="column" gap="32">
        <Icon textColor="purple.30" name="Warning" size="32" width="40" height="40" />
        <Box>
          <Text textColor="neutral.40" size="3">
            You need a valid bitrise.yml file on the main branch - the one you set up when you added the app to Bitrise
            - of your app before proceeding. A missing or invalid bitrise.yml file might break your build pipeline!
          </Text>
        </Box>
      </Box>
    </DialogBody>
    <DialogFooter>
      <ButtonGroup display="flex" spacing="0" justifyContent="end" gap="24">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </ButtonGroup>
    </DialogFooter>
  </Dialog>
);

export default ConfirmSwitchToRepositoryYml;
