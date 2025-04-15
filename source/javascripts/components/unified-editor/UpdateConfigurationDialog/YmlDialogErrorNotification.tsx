import { ReactNode } from 'react';
import { Notification, NotificationProps, Text } from '@bitrise/bitkit';
import { ClientError } from '@/core/api/client';

type Props = {
  error: ClientError | undefined;
};

const YmlDialogErrorNotification = (props: Props) => {
  const { error } = props;
  const message = error?.getResponseErrorMessage() || error?.message || 'Unknown error occurred';

  let action: NotificationProps['action'];
  let content: ReactNode = message;

  if (error?.status === 404) {
    content =
      "Couldn't find the bitrise.yml file in the app's repository. Please make sure that the file exists on the default branch and the app's Service Credential User has read rights on that.";
  } else if (message && message.includes('Split configuration requires an Enterprise plan')) {
    content = (
      <>
        <Text fontWeight="bold">Split configuration requires an Enterprise plan</Text>
        Contact our customer support if you'd like to try it out.
      </>
    );
    action = {
      href: 'https://bitrise.io/contact',
      label: 'Contact us',
      target: '_blank',
    };
  }

  return (
    <Notification marginBlockStart="24" status="error" action={action}>
      {content}
    </Notification>
  );
};

export default YmlDialogErrorNotification;
