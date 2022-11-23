import { Box, Text, Icon, TypeIconName } from "@bitrise/bitkit";

type StepItemProps = {
	icon: TypeIconName;
	isActive: boolean;
	title: string;
	description: string;
	onClick(): void;
};

const YmlStorageOption = ({ isActive, title, description, icon, onClick }: StepItemProps): JSX.Element => (
	<Box
		boxShadow="medium"
		backgroundColor={isActive ? "purple.95" : "white"}
		borderStyle="solid"
		borderColor={isActive ? "purple.50" : "neutral.93"}
		borderWidth={isActive ? "0.125rem" : "0.0625rem"}
		borderRadius="8"
		display="flex"
		flexDirection="row"
		padding="16"
		gap="12"
		flexBasis="100%"
		flexGrow="1"
		flexShrink="1"
		minWidth="0"
		onClick={onClick}
		cursor="pointer"
	>
		<Icon textColor="purple.30" name={icon}></Icon>
		<Box flexGrow="1" flexShrink="1" minWidth="0">
			<Text fontWeight="bold" size="3" textColor="purple.10">
				{title}
			</Text>
			<Text size="2" textColor="neutral.40">
				{description}
			</Text>
		</Box>
	</Box>
);

export default YmlStorageOption;
