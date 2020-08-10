import React, { FC } from "react";
import { Flex, Text } from "@bitrise/bitkit";
import InlineLink from "../common/InlineLink";

type Props = {
	title: string;
	description: string;
};

const StoreInRepositoryDescription: FC<Props> = ({ title, description }: Props) => (
	<Flex direction="vertical" gap="x4">
		<Text config="5" textColor="gray-8">
			{title}
		</Text>
		<Text textColor="gray-7" config="7">
			<Text inline>{description}</Text>
			<Text inline>
				Read more in{" "}
				<InlineLink text="our documentation" url="https://devcenter.bitrise.io/builds/bitrise-yml-online/" />
			</Text>
		</Text>
	</Flex>
);

export default StoreInRepositoryDescription;
