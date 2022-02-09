import React from "react";
import { Flex, Link, List, ListItem, Notification, Text, variables } from "@bitrise/bitkit";

import "./Description.scss";

type DescriptionProps = {
	hasTriggers: boolean;
};

const Description = ({ hasTriggers }: DescriptionProps): JSX.Element => (
	<Flex
		direction="vertical"
		gap="x6"
		className="TriggersDescription"
		textColor="gray-8"
		style={{ paddingBottom: variables.sizeX6 }}
	>
		{!hasTriggers && <Notification type="warning">No triggers are currently set for this app</Notification>}
		<Flex direction="vertical" gap="x2">
			<Text config="4" weight="bold" textColor="grape-5">
				Triggers
			</Text>
			<Text config="7">
				Triggers are required in order to run builds automatically. To set one up, you need to specify:{" "}
			</Text>
			<List>
				<ListItem>
					the <strong>event</strong>: for example, code push or pull request.
				</ListItem>
				<ListItem>
					the <strong>branch</strong> of your repository: for example, master or dev.
				</ListItem>
			</List>
			<Text config="7">
				Note: a webhook must be in place for a trigger to work.{" "}
				<Link
					underline
					color="grape-3"
					href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
					target="_blank"
				>
					Learn more
				</Link>
			</Text>
		</Flex>
	</Flex>
);

export default Description;
