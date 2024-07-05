import { useEffect, useState } from 'react';
import { Box, Button, Card, Text, Notification, useDisclosure } from '@bitrise/bitkit';
import ConfigurationYmlSourceDialog from '../ConfigurationYmlSource/ConfigurationYmlSourceDialog';
import { AppConfig } from '../../models/AppConfig';
import usePutUserMetaData from '../../hooks/api/usePutUserMetaData';
import useGetUserMetaData from '../../hooks/api/useGetUserMetaData';

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
  lastModified: string | null;
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
  const metaDataKey = modularYmlSupported
    ? 'wfe_modular_yml_enterprise_notification_closed'
    : 'wfe_modular_yml_split_notification_closed';

  const { call: putNotificationMetaData } = usePutUserMetaData(metaDataKey, true);

  const notificationMetaDataResponse = useGetUserMetaData(metaDataKey);

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isNotificationOpen, setIsNotificationOpen] = useState(true);

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
    putNotificationMetaData();
  };

  useEffect(() => {
    notificationMetaDataResponse.call();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = notificationMetaDataResponse.value === null;

  useEffect(() => {
    if (showNotification === true) {
      setIsNotificationOpen(true);
    }
  }, [showNotification]);

  let notification;
  if (isNotificationOpen && !split && lines > 500) {
    notification = (
      <Notification
        status="info"
        action={{
          href: 'https://devcenter.bitrise.io/builds/bitrise-yml-online/',
          label: 'Learn more',
          target: '_blank',
        }}
        onClose={handleNotificationClose}
        marginBlockEnd="24"
      >
        <Text textStyle="heading/h4">Optimize your configuration file</Text>
        <Text>
          We recommend splitting your configuration file with {lines} lines of code into smaller, more manageable files
          for easier maintenance.{' '}
          {modularYmlSupported ? '' : 'This feature is only available for Workspaces on Enterprise plan.'}
        </Text>
      </Notification>
    );
  }

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
      {notification}
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
