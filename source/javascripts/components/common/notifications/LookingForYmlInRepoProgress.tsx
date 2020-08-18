import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";

const LookingForYmlInRepoProgress: FC = () => (
	<Notification type="progress">Looking for bitrise.yml in the app repository...</Notification>
);

export default LookingForYmlInRepoProgress;
