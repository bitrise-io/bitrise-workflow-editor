import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";
import { WFEWindow } from "../../../typings/global";

declare let window: WFEWindow;

const CreatingYmlOnWebsiteProgress: FC = () => (
	<Notification type="progress">{window.strings["yml"]["store_on_website"]["loading"]}</Notification>
);

export default CreatingYmlOnWebsiteProgress;
