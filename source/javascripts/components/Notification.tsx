import { FunctionComponent } from 'react';
import { Notification as BitkitNotification, NotificationProps, Text } from '@bitrise/bitkit';

type Props = {
  message: string;
  title?: string;
  status: NotificationProps['status'];
};

const Notification: FunctionComponent<Props> = ({ message, status, title }: Props) => {
  if (title) {
    return (
      <BitkitNotification status={status}>
        {title && <Text fontWeight="bold">{title}</Text>}
        <Text>{message}</Text>
      </BitkitNotification>
    );
  }

  return <BitkitNotification status={status}>{message}</BitkitNotification>;
};

export default Notification;
