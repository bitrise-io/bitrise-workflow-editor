import { Box, Button, Card, Text, useDisclosure } from '@bitrise/bitkit';
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
      <ConfigurationYmlSourceDialog
        isOpen={isOpen}
        onClose={onClose}
        initialUsesRepositoryYml={!!usesRepositoryYml}
        appConfig={appConfig}
        appSlug={appSlug}
        onUsesRepositoryYmlChangeSaved={onUsesRepositoryYmlChangeSaved}
        defaultBranch={defaultBranch}
        gitRepoSlug={gitRepoSlug}
      />
    </>
  );
};

export default YmlEditorHeader;
