import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";

const YmlNotFoundInRepositoryError: FC = () => (
	<Notification type="alert">
		Couldn't find a bitrise.yml file in the app's repository. Add the file to your main branch and try again.
	</Notification>
);

export default YmlNotFoundInRepositoryError;
