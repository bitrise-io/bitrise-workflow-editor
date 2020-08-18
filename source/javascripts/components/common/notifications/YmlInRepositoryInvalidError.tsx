import React, { FC } from "react";
import { Text, Notification, Flex } from "@bitrise/bitkit";
import InlineLink from "../InlineLink";

type Props = {
	errorMessage: string;
};

const YmlInRepositoryInvalidError: FC<Props> = ({ errorMessage }: Props) => (
	<Notification type="alert" alignChildren="start">
		<Flex direction="vertical" gap="x4">
			<Text>
				The bitrise.yml file in the repository seems invalid. Please review and fix it before proceeding. Read more
				about the{" "}
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
