import { FunctionComponent } from 'react';
import { Link, Notification } from '@bitrise/bitkit';

type NotificationStatus = 'info' | 'error' | 'success' | 'warning' | 'progress';

type Props = {
  type: NotificationStatus;
  message: string;
  linkUrl: string;
  linkText: string;
};

const NotificationMessageWithLink: FunctionComponent<Props> = ({ message, type, linkUrl, linkText }: Props) => (
  <Notification status={type}>
    <>
      {message}{' '}
      <Link href={linkUrl} isUnderlined isExternal>
        {linkText}
      </Link>
    </>
  </Notification>
);

export default NotificationMessageWithLink;
