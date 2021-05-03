import React, { FC } from "react";
import { Notification } from "@bitrise/bitkit";
import { WFEWindow } from "../../../typings/global";

const YmlNotFoundInRepositoryError: FC = () => (
	<Notification type="alert">{(window as WFEWindow).strings["yml"]["store_in_repository"]["not_found"]}</Notification>
);

export default YmlNotFoundInRepositoryError;
