import React, { FunctionComponent } from 'react'
import { Notification } from "@bitrise/bitkit";

type Props = {
  message: string
};

const ErrorNotification: FunctionComponent<Props> = ({ message }: Props) => (
  <Notification type="alert">{message}</Notification>
);

export default ErrorNotification;
