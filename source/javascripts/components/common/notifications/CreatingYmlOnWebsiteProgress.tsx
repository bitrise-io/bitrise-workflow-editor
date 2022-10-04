import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";
import { WFEWindow } from "../../../typings/global";

const CreatingYmlOnWebsiteProgress: FC = () => (
	<Notification status="progress">{(window as WFEWindow).strings["yml"]["store_on_website"]["loading"]}</Notification>
);

export default CreatingYmlOnWebsiteProgress;
