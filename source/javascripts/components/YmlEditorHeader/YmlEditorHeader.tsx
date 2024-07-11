import { useEffect, useState } from 'react';
import { Box, Button, Text, Notification, useDisclosure, DataWidget, DataWidgetItem, Tooltip } from '@bitrise/bitkit';
import ConfigurationYmlSourceDialog from '../ConfigurationYmlSource/ConfigurationYmlSourceDialog';
import { AppConfig } from '../../models/AppConfig';
import usePutUserMetaData from '../../hooks/api/usePutUserMetaData';
import useGetUserMetaData from '../../hooks/api/useGetUserMetaData';

export type YmlEditorHeaderProps = {
  appSlug: string;
  appConfig: AppConfig | string;
  url: string;
  initialUsesRepositoryYml?: boolean;
  repositoryYmlAvailable: boolean;
  shouldShowYmlStorageSettings: boolean;
  onUsesRepositoryYmlChangeSaved: (usesRepositoryYml: boolean) => void;
  defaultBranch: string;
  gitRepoSlug: string;
  split: boolean;
  modularYamlSupported: boolean;
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
  initialUsesRepositoryYml,
  split,
  modularYamlSupported,
  lines,
  lastModified,
}: YmlEditorHeaderProps) => {
  const metaDataKey = modularYamlSupported
    ? 'wfe_modular_yaml_enterprise_notification_closed'
    : 'wfe_modular_yaml_split_notification_closed';

  const { call: putNotificationMetaData } = usePutUserMetaData(metaDataKey, true);

  const notificationMetaDataResponse = useGetUserMetaData(metaDataKey);

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [usesRepositoryYml, setUsesRepositoryYml] = useState(!!initialUsesRepositoryYml);

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
          {modularYamlSupported ? '' : 'This feature is only available for Workspaces on Enterprise plan.'}
        </Text>
      </Notification>
    );
  }

  let infoLabel;
  if (usesRepositoryYml) {
    infoLabel = split
      ? `The root configuration YAML is stored on ${gitRepoSlug} repository’s ${defaultBranch} branch. It also use configuration from other files.`
      : `Stored on ${gitRepoSlug} repository’s ${defaultBranch} branch.`;
  }

  const isChangeEnabled = repositoryYmlAvailable || initialUsesRepositoryYml === true;

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
          <DataWidget
            additionalElement={
              <Tooltip
                isDisabled={isChangeEnabled}
                label="Upgrade to a Teams or Enterprise plan to be able to change the source to a Git repository."
              >
                <Button isDisabled={!isChangeEnabled} onClick={onOpen} size="sm" variant="tertiary">
                  Change
                </Button>
              </Tooltip>
            }
            infoLabel={infoLabel}
          >
            <DataWidgetItem
              label="Source:"
              labelTooltip="The source is where your configuration file is stored and managed."
              value={usesRepositoryYml ? 'Git repository' : 'bitrise.io'}
            />
          </DataWidget>
        )}
      </Box>
      {notification}
      <ConfigurationYmlSourceDialog
        isOpen={isOpen}
        onClose={onClose}
        initialUsesRepositoryYml={usesRepositoryYml}
        appConfig={appConfig}
        appSlug={appSlug}
        onUsesRepositoryYmlChangeSaved={(newValue: boolean) => {
          onUsesRepositoryYmlChangeSaved(newValue);
          setUsesRepositoryYml(newValue);
        }}
        defaultBranch={defaultBranch}
        gitRepoSlug={gitRepoSlug}
        lastModified={lastModified}
      />
    </>
  );
};

export default YmlEditorHeader;
