import { Link, Notification, NotificationProps } from '@bitrise/bitkit';

import GlobalProps from '@/core/utils/GlobalProps';

type Props = {
  machineTypeId: string;
};

const DeprecatedMachineNotification = (props: Props) => {
  const { machineTypeId } = props;

  const deprecatedMachinesReplacementConfig = GlobalProps.workspace()?.useReplacementForDeprecatedMachines;

  if (!deprecatedMachinesReplacementConfig || !['standard', 'elite', 'elite-xl'].includes(machineTypeId)) {
    return null;
  }
  const { grace_period_started_at: gracePeriodStartedAt, grace_period_ended_at: gracePeriodEndedAt } =
    deprecatedMachinesReplacementConfig;
  if (!gracePeriodStartedAt || !gracePeriodEndedAt) {
    return null;
  }

  const notificationProps: NotificationProps = {
    marginBlockStart: '16',
    status: 'info',
  };

  const currentDate = new Date();
  const startDate = new Date(gracePeriodStartedAt);
  const endDate = new Date(gracePeriodEndedAt);

  if (currentDate < startDate) {
    return (
      <Notification {...notificationProps}>
        Upgrading to newer generation M/2M/4L Linux machines, with no extra costs. Medium/Large/X Large machines will be
        deprecated and your Workflows will automatically run on newer generation M/2M/4L Linux machines from{' '}
        {startDate.toLocaleDateString()}.{' '}
        <Link
          href="https://docs.google.com/document/d/1aZw_nhce3qZus84qwUpoDGYtTdlSbYDnqd6E_WLVeow"
          isExternal
          isUnderlined
        >
          Read announcement
        </Link>
      </Notification>
    );
  }
  if (currentDate >= startDate && currentDate <= endDate) {
    return (
      <Notification {...notificationProps}>
        Your Workflows were automatically switched to newer generation M/2M/4L Linux machines, with no extra costs. To
        continue using the deprecated Medium/Large/X Large machines until {endDate.toLocaleDateString()}, opt to extend
        the transition period in the {startDate.toLocaleDateString()}.{' '}
        <Link href={`/workspaces/${GlobalProps.workspaceSlug()}/settings/apps`} isExternal isUnderlined>
          Workspace settings
        </Link>
      </Notification>
    );
  }
  if (currentDate > endDate) {
    return (
      <Notification {...notificationProps}>
        Your Workflows are now running on newer generation M/2M/4L Linux machines, with no extra costs. If you’d like to
        keep using the deprecated Medium/Large/X Large machines, reach out to support.{' '}
        <Link
          href="https://docs.google.com/document/d/1aZw_nhce3qZus84qwUpoDGYtTdlSbYDnqd6E_WLVeow"
          isExternal
          isUnderlined
        >
          Read announcement
        </Link>
      </Notification>
    );
  }
};

export default DeprecatedMachineNotification;
