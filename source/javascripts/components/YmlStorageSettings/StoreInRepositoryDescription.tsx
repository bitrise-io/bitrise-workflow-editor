import { Box, Link, Text } from "@bitrise/bitkit";

type Props = {
	title: string;
	description: string;
};

const StoreInRepositoryDescription = ({ title, description }: Props): JSX.Element => (
	<Box display="flex" flexDirection="column" gap="16">
		<Text size="5" fontWeight="bold" textColor="neutral.30">
			{title}
		</Text>
		<Text textColor="neutral.40" size="3">
			<Text as="span">{description}</Text>
			<Text as="span">
				Read more in{" "}
				<Link isUnderlined href="https://devcenter.bitrise.io/builds/bitrise-yml-online/">
					our documentation
				</Link>
			</Text>
		</Text>
	</Box>
);

export default StoreInRepositoryDescription;
