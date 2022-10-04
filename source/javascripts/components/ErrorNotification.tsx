import { FunctionComponent } from "react";
import { Notification } from "@bitrise/bitkit";

type Props = {
	message: string;
};

const ErrorNotification: FunctionComponent<Props> = ({ message }: Props) => (
	<Notification status="error">{message}</Notification>
);

export default ErrorNotification;
