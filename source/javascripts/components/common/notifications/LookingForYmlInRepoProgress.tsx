import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";
import { WFEWindow } from "../../../typings/global";

const LookingForYmlInRepoProgress: FC = () => (
	<Notification type="progress">{(window as WFEWindow).strings["yml"]["store_in_repository"]["loading"]}</Notification>
);

export default LookingForYmlInRepoProgress;
