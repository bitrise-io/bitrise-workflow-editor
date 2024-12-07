import { ReactNode, useEffect, useState } from 'react';
import { Notification, NotificationProps, Text } from '@bitrise/bitkit';

type Props = {
  response: Response | undefined;
};

const YmlDialogErrorNotification = (props: Props) => {
  const { response } = props;
  const [parsedErrorResponse, setParsedErrorResponse] = useState<Record<'error_msg', string> | undefined>(undefined);

  const message = parsedErrorResponse?.error_msg || 'Unknown error';

  let action: NotificationProps['action'];
  let content: ReactNode = message;

  if (response?.status === 404) {
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

  useEffect(() => {
    const parse = async (resp: Response) => {
      const parsedJson = await resp.json();
      setParsedErrorResponse(parsedJson);
    };
    if (response) {
      parse(response);
    }
  }, [response]);

  return (
    <Notification marginBlockStart="24" status="error" action={action}>
      {content}
    </Notification>
  );
};

export default YmlDialogErrorNotification;
