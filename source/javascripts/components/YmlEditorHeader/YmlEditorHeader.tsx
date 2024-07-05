import { Box, Button, Card, Text, Notification, useDisclosure } from '@bitrise/bitkit';
import ConfigurationYmlSourceDialog from '../ConfigurationYmlSource/ConfigurationYmlSourceDialog';
import { AppConfig } from '../../models/AppConfig';

export type YmlEditorHeaderProps = {
  appSlug: string;
  appConfig: AppConfig | string;
  url: string;
  usesRepositoryYml?: boolean;
  repositoryYmlAvailable: boolean;
  shouldShowYmlStorageSettings: boolean;
  onUsesRepositoryYmlChangeSaved: (usesRepositoryYml: boolean) => void;
  defaultBranch: string;
  gitRepoSlug: string;
  split: boolean;
  modularYmlSupported: boolean;
  lines: number;
  lastModified: string;
};
const YmlEditorHeader = ({
  appSlug,
  appConfig,
  defaultBranch,
  gitRepoSlug,
  onUsesRepositoryYmlChangeSaved,
  repositoryYmlAvailable,
  shouldShowYmlStorageSettings,
  url,
  usesRepositoryYml,
  split,
  modularYmlSupported,
  lines,
  lastModified,
}: YmlEditorHeaderProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Box display="flex" gap="16" alignItems="center" marginBlockEnd="24" minHeight="40">
        <Text as="h2" alignSelf="flex-start" marginInlineEnd="auto" textStyle="heading/h2">
          Configuration YAML
        </Text>
        {url && (
          <Button as="a" href={url} leftIconName="Download" size="sm" target="_blank" variant="tertiary">
            Download
          </Button>
        )}
        {shouldShowYmlStorageSettings && (
          <Card height="40" variant="outline" width="auto">
            <Button isDisabled={!repositoryYmlAvailable} onClick={onOpen} size="sm" variant="tertiary">
              Change
            </Button>
          </Card>
        )}
      </Box>
      {!split && lines > 500 && (
        <Notification status="info" action={{ label: 'Learn more' }} onClose={onClose}>
          <Text textStyle="heading/h4">Optimize your configuration file</Text>
          <Text>
            Your configuration file is {lines} lines of code. For easier maintenance, we recommend split it up into
            smaller, more manageable files. This feature is only available for Workspaces on Enterprise plan.
          </Text>
        </Notification>
      )}
      {modularYmlSupported && (
        <Notification status="info" action={{ label: 'Learn more' }} onClose={onClose}>
          <Text textStyle="heading/h4">Optimize your configuration file</Text>
          <Text>
            We recommend splitting your configuration file with {lines} lines of code into smaller, more manageable
            files for easier maintenance. This feature is only available for Workspaces on Enterprise plan.
          </Text>
        </Notification>
      )}
      {!modularYmlSupported && (
        <Notification status="info" action={{ label: 'Learn more' }} onClose={onClose}>
          <Text textStyle="heading/h4">Optimize your configuration file</Text>
          <Text>
            We recommend splitting your configuration file with {lines} lines of code into smaller, more manageable
            files for easier maintenance.
          </Text>
        </Notification>
      )}
      <ConfigurationYmlSourceDialog
        isOpen={isOpen}
        onClose={onClose}
        initialUsesRepositoryYml={!!usesRepositoryYml}
        appConfig={appConfig}
        appSlug={appSlug}
        onUsesRepositoryYmlChangeSaved={onUsesRepositoryYmlChangeSaved}
        defaultBranch={defaultBranch}
        gitRepoSlug={gitRepoSlug}
        lastModified={lastModified}
      />
    </>
  );
};

export default YmlEditorHeader;
