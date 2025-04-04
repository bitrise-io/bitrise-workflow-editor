import { NotificationProps, Link, Text } from '@bitrise/bitkit';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import useDefaultStackAndMachine from '@/hooks/useDefaultStackAndMachine';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import { DeprecatedMachinesReplacementConfig } from '@/core/models/MachineType';
import GlobalProps from '@/core/utils/GlobalProps';

const getDeprecatedMachinesProps = (deprecatedMachinesReplacementConfig?: DeprecatedMachinesReplacementConfig) => {
  if (!deprecatedMachinesReplacementConfig) {
    return undefined;
  }
  const { gracePeriodStartedAt, gracePeriodEndedAt } = deprecatedMachinesReplacementConfig;
  if (!gracePeriodStartedAt || !gracePeriodEndedAt) {
    return undefined;
  }

  const currentDate = new Date();
  const startDate = new Date(gracePeriodStartedAt);
  const endDate = new Date(gracePeriodEndedAt);

  const notificationProps: NotificationProps = {
    status: 'info',
  };

  if (currentDate < startDate) {
    notificationProps.children = (
      <>
        Upgrading to faster Pro Medium/Large/X Large, with no extra costs. Medium/Large/X Large machines will be
        deprecated and your Workflows will automatically run on Pro Medium/Large/X Large machines from{' '}
        {startDate.toLocaleDateString()}.{' '}
        <Link
          href="https://docs.google.com/document/d/1aZw_nhce3qZus84qwUpoDGYtTdlSbYDnqd6E_WLVeow"
          isExternal
          isUnderlined
        >
          Read announcement
        </Link>
      </>
    );
  }
  if (currentDate >= startDate && currentDate <= endDate) {
    notificationProps.children = (
      <>
        Your Workflows were automatically switched to faster Pro Medium/Large/X Large, with no extra costs. To continue
        using the deprecated Medium/Large/X Large machines until {endDate.toLocaleDateString()}, opt to extend the
        transition period in the {startDate.toLocaleDateString()}.{' '}
        <Link href={`/workspaces/${GlobalProps.workspaceSlug()}/settings/apps`} isExternal isUnderlined>
          Workspace settings
        </Link>
      </>
    );
  }
  if (currentDate > endDate) {
    notificationProps.children = (
      <>
        Your Workflows are now running on faster Pro Medium/Large/X Large, with no extra costs. If you’d like to keep
        using the deprecated Medium/Large/X Large machines, reach out to support.{' '}
        <Link
          href="https://docs.google.com/document/d/1aZw_nhce3qZus84qwUpoDGYtTdlSbYDnqd6E_WLVeow"
          isExternal
          isUnderlined
        >
          Read announcement
        </Link>
      </>
    );
  }

  return notificationProps;
};

const DefaultStackAndMachine = () => {
  const { stackId, machineTypeId, stackRollbackVersion } = useDefaultStackAndMachine();
  const updateStacksAndMachinesMeta = useBitriseYmlStore((s) => s.updateStacksAndMachinesMeta);

  const updateDefaultMeta = (stack: string, machine_type_id: string, stack_rollback_version: string) => {
    updateStacksAndMachinesMeta({
      stack,
      machine_type_id,
      stack_rollback_version,
    });
  };

  return (
    <div>
      <Text as="h4" textStyle="heading/h4" mb="12">
        Default stack & machine
      </Text>
      <StackAndMachine
        stackId={stackId}
        machineTypeId={machineTypeId}
        onChange={updateDefaultMeta}
        stackRollbackVersion={stackRollbackVersion}
        withoutDefaultStack
        notificationProps={getDeprecatedMachinesProps(PageProps.app()?.deprecatedMachinesReplacementConfig)}
      />
    </div>
  );
};

export default DefaultStackAndMachine;
