import { Link, Notification, Text } from '@bitrise/bitkit';
import useNavigation from '@/hooks/useNavigation';

const SecretsLink = () => {
  const { replace } = useNavigation();

  return (
    <Link href="#/secrets" onClick={() => replace('/secrets')} isUnderlined>
      Secrets
    </Link>
  );
};

const PrivateInfoNotification = () => {
  return (
    <Notification status="warning">
      <Text textStyle="comp/notification/title">You should not add private information here.</Text>
      <Text textStyle="comp/notification/message">
        These environment variables will also be available in builds triggered by pull requests and bitrise.yml. For
        private info, use <SecretsLink />.
      </Text>
    </Notification>
  );
};

export default PrivateInfoNotification;
