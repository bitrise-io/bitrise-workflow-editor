import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";
import { WFEWindow } from "../../../typings/global";

declare let window: WFEWindow;

const YmlNotFoundInRepositoryError: FC = () => (
	<Notification type="alert">{window.strings["yml"]["store_in_repository"]["not_found"]}</Notification>
);

export default YmlNotFoundInRepositoryError;
