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
  useToast,
} from '@bitrise/bitkit';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useFormattedYml } from '../common/RepoYmlStorageActions';
import { AppConfig } from '../../models/AppConfig';

type ConfigurationYmlSourceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  initialUsesRepositoryYml: boolean;
  appConfig: AppConfig | string;
};

const ConfigurationYmlSourceDialog = (props: ConfigurationYmlSourceDialogProps) => {
  const { isOpen, onClose, initialUsesRepositoryYml, appConfig } = props;

  const [usesRepositoryYml, setUsesRepositoryYml] = useState(initialUsesRepositoryYml);
  const [actionSelected, setActionSelected] = useState<string | null>(null);
  const [clearActionTimeout, setClearActionTimeout] = useState<number | undefined>();

  const yml = useFormattedYml(appConfig);

  const selectAction = (actionName: string): void => {
    setActionSelected(actionName);

    if (clearActionTimeout) {
      window.clearTimeout(clearActionTimeout);
    }

    setClearActionTimeout(window.setTimeout(() => setActionSelected(null), 5000));
  };

  const toast = useToast();

  if (actionSelected) {
    toast({
      title: actionSelected === 'clipboard' ? ' Copied to clipboard' : 'Downloading the configuration YAML',
      description:
        actionSelected === 'clipboard'
          ? 'Commit the content of the current configuration YAML file to the app’s repository before updating the setting. '
          : 'Commit the file to the app’s repository before updating the setting. ',
      status: 'success',
      isClosable: true,
    });
  }

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
                helperText={
                  <>
                    Multiple configuration files will be merged into a single file.{' '}
                    <Link
                      href="https://devcenter.bitrise.io/builds/bitrise-yml-online/"
                      colorScheme="purple"
                      isExternal
                    >
                      Learn more
                    </Link>
                  </>
                }
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
                  <Link
                    href={`data:attachment/text,${encodeURIComponent(yml)}`}
                    target="_blank"
                    download="bitrise.yml"
                    onClick={() => selectAction('download')}
                  >
                    <Button variant="tertiary" leftIconName="Download" width="fit-content" size="sm">
                      Download current version
                    </Button>
                  </Link>
                  <CopyToClipboard text={yml} onCopy={() => selectAction('clipboard')}>
                    <Button
                      variant="tertiary"
                      leftIconName="Duplicate"
                      width="fit-content"
                      size="sm"
                      marginBlockEnd="16"
                    >
                      Copy configuration content
                    </Button>
                  </CopyToClipboard>
                </Box>
              </ListItem>
              <ListItem>
                Provide repository access
                <Text textStyle="body/md/regular" color="text/secondary" marginBlockEnd="16">
                  Ensure Bitrise has read access to all the repositories where you store your configuration files.{' '}
                  <Link href="https://devcenter.bitrise.io/builds/bitrise-yml-online/" colorScheme="purple" isExternal>
                    Learn more
                  </Link>
                </Text>
              </ListItem>
              <ListItem>
                Split up your configuration{' '}
                <Text as="span" color="text/secondary">
                  (optional)
                </Text>
                <Text textStyle="body/md/regular" color="text/secondary">
                  <Link href="" colorScheme="purple" isExternal>
                    Follow this guide
                  </Link>{' '}
                  to split up your configuration into smaller, more manageable files. This feature is only available for
                  Workspaces on{' '}
                  <Text as="span" textStyle="body/md/semibold">
                    Enterprise plan.
                  </Text>{' '}
                  <Link href="https://devcenter.bitrise.io/builds/bitrise-yml-online/" colorScheme="purple" isExternal>
                    Learn more
                  </Link>
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
