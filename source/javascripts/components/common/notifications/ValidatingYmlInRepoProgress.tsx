import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";

const ValidatingYmlInRepoProgress: FC = () => (
	<Notification type="progress">Validating bitrise.yml in the app repository...</Notification>
);

export default ValidatingYmlInRepoProgress;
