import { Notification, Text } from '@bitrise/bitkit';

type NotificationProps = {
  modularYamlSupported?: boolean;
  lines: number;
  onClose: VoidFunction;
};

const SplitNotification = ({ lines, modularYamlSupported, onClose }: NotificationProps) => {
  return (
    <Notification
      status="info"
      action={{
        href: 'https://devcenter.bitrise.io/en/builds/yaml-configuration/modular-yaml-configuration.html',
        label: 'Learn more',
        target: '_blank',
      }}
      onClose={onClose}
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
};

export default SplitNotification;
