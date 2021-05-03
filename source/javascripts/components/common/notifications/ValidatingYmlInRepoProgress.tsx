import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";
import { WFEWindow } from "../../../typings/global";

const ValidatingYmlInRepoProgress: FC = () => (
	<Notification type="progress">
		{(window as WFEWindow).strings["yml"]["store_in_repository"]["validation_loading"]}
	</Notification>
);

export default ValidatingYmlInRepoProgress;
