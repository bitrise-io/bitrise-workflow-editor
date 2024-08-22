import { FunctionComponent } from 'react';
import { Notification as BitkitNotification, NotificationProps, Text } from '@bitrise/bitkit';

type Props = {
  message: string;
  title?: string;
  status: NotificationProps['status'];
  action?: NotificationProps['action'];
};

const Notification: FunctionComponent<Props> = ({ message, status, title, action }: Props) => {
  if (title) {
    return (
      <BitkitNotification status={status} action={action}>
        {title && <Text fontWeight="bold">{title}</Text>}
        <Text>{message}</Text>
      </BitkitNotification>
    );
  }

  return (
    <BitkitNotification status={status} action={action}>
      {message}
    </BitkitNotification>
  );
};

export default Notification;
