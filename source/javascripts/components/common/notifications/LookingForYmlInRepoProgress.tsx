import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";
import { WFEWindow } from "../../../typings/global";

declare let window: WFEWindow;

const LookingForYmlInRepoProgress: FC = () => (
	<Notification type="progress">{window.strings["yml"]["store_in_repository"]["loading"]}</Notification>
);

export default LookingForYmlInRepoProgress;
