import { useState } from 'react';
import {
  Button,
  Link,
  SettingsCard,
  SettingsCardActions,
  SettingsCardData,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';
import { getGitStatusReportData, ProjectLevelStatusTitle, StatusReportType } from './GitStatusReport.util';
import GitNamingPatternDialog from './GitNamingPatternDialog';

type GitStatusReportProps = {
  app: any;
  statusReport: StatusReportType;
  canChangeSettings: boolean;
};

const GitStatusReport = (props: GitStatusReportProps) => {
  const { app, canChangeSettings, statusReport } = props;
  const { defaultStatus, statusMap } = getGitStatusReportData(statusReport);
  const [latestStatus, setLatestStatus] = useState(statusMap[defaultStatus].title);
  const [latestTemplate, setLatestTemplate] = useState(statusMap[defaultStatus].template);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleStatusUpdate = (newStatus: ProjectLevelStatusTitle, newTemplate: string | null) => {
    setLatestStatus(newStatus);
    setLatestTemplate(newTemplate);
  };

  return (
    <>
      <Text as="h2" textStyle="heading/h2">
        Default Git status report
      </Text>
      <Text>
        Set the default Git status naming pattern. You can also override the default individually in Workflows and
        Pipelines.{' '}
        <Link colorScheme="purple" href="https://devcenter.bitrise.io" isExternal>
          Read documentation
        </Link>
      </Text>
      <SettingsCard>
        <SettingsCardData label="Default naming pattern" data={latestStatus} secondaryLabel={latestTemplate} />
        {!!canChangeSettings && (
          <SettingsCardActions>
            <Button variant="tertiary" leftIconName="Configure" size="sm" onClick={onOpen}>
              Change
            </Button>
          </SettingsCardActions>
        )}
      </SettingsCard>
      <GitNamingPatternDialog
        isOpen={isOpen}
        onClose={onClose}
        app={app}
        statusReport={statusReport}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
};

export default GitStatusReport;
