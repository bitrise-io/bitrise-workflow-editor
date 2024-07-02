import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Link,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Text,
} from '@bitrise/bitkit';

type ConfigurationYmlSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  initialUsesRepositoryYml: boolean;
};

const ConfigurationYmlSourceDialog = (props: ConfigurationYmlSourceDialogProps) => {
  const { isOpen, onClose, initialUsesRepositoryYml } = props;
  const [usesRepositoryYml, setUsesRepositoryYml] = useState(initialUsesRepositoryYml);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Configuration YAML source">
      <DialogBody>
        <Text textStyle="body/md/semibold" marginBlockEnd="12">
          Source
        </Text>
        <RadioGroup
          onChange={(value: 'bitrise' | 'git') => {
            setUsesRepositoryYml(value === 'git');
          }}
          value={usesRepositoryYml ? 'git' : 'bitrise'}
        >
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
        {!usesRepositoryYml && (
          <>
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
          </>
        )}
        {usesRepositoryYml && (
          <>
            <Divider marginY="24" />
            <Text marginBlockEnd="4" textStyle="heading/h3">
              Complete the following tasks
            </Text>
            <Text marginBlockEnd="24">
              Make sure to complete all the mandatory tasks before updating. A missing or invalid configuration file can
              lead to failed builds.
            </Text>
            <List isOrdered>
              <ListItem>
                Add configuration file
                <Text textStyle="body/md/regular" color="text/secondary" marginBlockEnd="8">
                  Add your current configuration YAML from Bitrise to your repository_name repository’s{' '}
                  default_branch_name branch.{' '}
                  <Link href="https://devcenter.bitrise.io/builds/bitrise-yml-online/" colorScheme="purple" isExternal>
                    Learn more
                  </Link>
                </Text>
                <Box display="flex" flexDir="column" gap="8">
                  <Button variant="tertiary" leftIconName="Download" width="fit-content" size="sm">
                    Download current version
                  </Button>
                  <Button variant="tertiary" leftIconName="Duplicate" width="fit-content" size="sm">
                    Copy configuration content
                  </Button>
                </Box>
              </ListItem>
              <ListItem>
                Provide repository access
                <Text>
                  Ensure Bitrise has read access to all the repositories where you store your configuration files.{' '}
                  <Link href="https://devcenter.bitrise.io/builds/bitrise-yml-online/">Learn more</Link>
                </Text>
              </ListItem>
            </List>
          </>
        )}
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
