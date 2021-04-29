import React, { FC } from "react";
import { Text, Notification, Flex } from "@bitrise/bitkit";
import InlineLink from "../InlineLink";
import { WFEWindow } from "../../../typings/global";

type Props = {
	errorMessage: string;
};

const YmlInRepositoryInvalidError: FC<Props> = ({ errorMessage }: Props) => (
	<Notification type="alert" alignChildren="start">
		<Flex direction="vertical" gap="x4">
			<Text>
				{(window as WFEWindow).strings["yml"]["store_in_repository"]["validation_error"]}{" "}
				<InlineLink
					underline
					color="red-4"
					text="valid syntax of the bitrise.yml file."
					url="https://devcenter.bitrise.io/builds/bitrise-yml-online/"
				/>
			</Text>
			<Text>{errorMessage}</Text>
		</Flex>
	</Notification>
);

export default YmlInRepositoryInvalidError;
