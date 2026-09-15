import { Link } from '@bitrise/bitkit';
import { BitkitAlert } from '@bitrise/bitkit-v2';

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

  const alertProps = {
    marginBlockStart: '16',
    variant: 'info',
  } as const;

  const currentDate = new Date();
  const startDate = new Date(gracePeriodStartedAt);
  const endDate = new Date(gracePeriodEndedAt);

  if (currentDate < startDate) {
    return (
      <BitkitAlert
        {...alertProps}
        messageText={
          <>
            Upgrading to newer generation AMD EPYC Zen4 Linux machines, with no extra costs. Standard machines will be
            deprecated and your Workflows will automatically run on newer generation AMD EPYC Zen4 Linux machines from{' '}
            {startDate.toLocaleDateString()}.{' '}
            <Link
              href="https://docs.google.com/document/d/1DjttMcPHn4c76bVG6_jDQ4RfG08oLTMJ8rusHUA-0gE"
              isExternal
              isUnderlined
            >
              Read announcement
            </Link>
          </>
        }
      />
    );
  }
  if (currentDate >= startDate && currentDate <= endDate) {
    return (
      <BitkitAlert
        {...alertProps}
        messageText={
          <>
            Your Workflows were automatically switched to newer generation AMD EPYC Zen4 Linux machines, with no extra
            costs. To continue using the deprecated Standard machine until {endDate.toLocaleDateString()}, opt to extend
            the transition period in the {startDate.toLocaleDateString()}.{' '}
            <Link href={`/workspaces/${GlobalProps.workspaceSlug()}/settings/apps`} isExternal isUnderlined>
              Workspace settings
            </Link>
          </>
        }
      />
    );
  }
  if (currentDate > endDate) {
    return (
      <BitkitAlert
        {...alertProps}
        messageText={
          <>
            Your Workflows are now running on newer generation AMD EPYC Zen4 Linux machines, with no extra costs. If
            you'd like to keep using the deprecated Standard Linux machine, reach out to support.{' '}
            <Link
              href="https://docs.google.com/document/d/1DjttMcPHn4c76bVG6_jDQ4RfG08oLTMJ8rusHUA-0gE"
              isExternal
              isUnderlined
            >
              Read announcement
            </Link>
          </>
        }
      />
    );
  }
};

export default DeprecatedMachineNotification;
