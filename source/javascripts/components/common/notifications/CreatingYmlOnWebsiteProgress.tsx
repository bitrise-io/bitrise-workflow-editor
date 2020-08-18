import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";

const CreatingYmlOnWebsiteProgress: FC = () => (
	<Notification type="progress">Creating bitrise.yml on bitrise.io...</Notification>
);

export default CreatingYmlOnWebsiteProgress;
