import { Box, Link, List, ListItem, Notification, Text } from "@bitrise/bitkit";

import "./Description.scss";

type DescriptionProps = {
	hasTriggers: boolean;
};

const Description = ({ hasTriggers }: DescriptionProps): JSX.Element => (
	<Box
		display="flex"
		flexDirection="column"
		gap="24"
		className="TriggersDescription"
		color="neutral.30"
		paddingBottom="24"
	>
		{!hasTriggers && <Notification status="warning">No triggers are currently set for this app</Notification>}
		<Box display="flex" flexDirection="column" gap="8">
			<Text size="5" fontWeight="bold" textColor="purple.10">
				Triggers
			</Text>
			<Text>
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
			<Text>
				Note: a webhook must be in place for a trigger to work.{" "}
				<Link
					isUnderlined
					colorScheme="purple"
					href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
					target="_blank"
				>
					Learn more
				</Link>
			</Text>
		</Box>
	</Box>
);

export default Description;
