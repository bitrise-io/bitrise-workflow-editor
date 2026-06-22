import { BitkitAlert, BitkitAlertProps } from '@bitrise/bitkit-v2';
import { ReactNode } from 'react';

import { ClientError } from '@/core/api/client';

type Props = Omit<BitkitAlertProps, 'variant' | 'titleText' | 'messageText' | 'action'> & {
  error: ClientError | undefined;
};

const YmlDialogErrorNotification = (props: Props) => {
  const { error, ...rest } = props;
  const message = error?.getResponseErrorMessage() || error?.message || 'Unknown error occurred';

  let action: BitkitAlertProps['action'];
  let title: ReactNode;
  let content: ReactNode = message;

  if (error?.status === 404) {
    content =
      "Couldn't find the bitrise.yml file in the app's repository. Please make sure that the file exists on the default branch and the app's Service Credential User has read rights on that.";
  } else if (message && message.includes('Split configuration requires an Enterprise plan')) {
    title = 'Split configuration requires an Enterprise plan';
    content = "Contact our customer support if you'd like to try it out.";
    action = {
      href: 'https://bitrise.io/contact',
      label: 'Contact us',
      target: '_blank',
    };
  }

  return <BitkitAlert variant="critical" titleText={title} messageText={content} action={action} {...rest} />;
};

export default YmlDialogErrorNotification;
