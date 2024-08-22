import { Notification } from '@bitrise/bitkit';

type Props = {
  onClose: VoidFunction;
};

const GitNotification = ({ onClose }: Props) => {
  return (
    <Notification status="info" onClose={onClose} marginBlockEnd="24">
      Your configuration in the Git repository is split across multiple files, but on this page you can see it as one
      merged YAML.
    </Notification>
  );
};

export default GitNotification;
