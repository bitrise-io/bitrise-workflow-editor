import { Badge, Box, Icon, Text, Tooltip, TypeIconName } from "@bitrise/bitkit";

type StepItemProps = {
	icon: TypeIconName;
	isActive: boolean;
	title: string;
	description: string;
	onClick(): void;
	available?: boolean;
};

const YmlStorageOption = ({
	isActive,
	title,
	description,
	icon,
	onClick,
	available = true,
}: StepItemProps): JSX.Element => (
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
		flexBasis="350px"
		flexGrow="1"
		flexShrink="1"
		minWidth="0"
		filter={available ? undefined : "opacity(0.6)"}
		onClick={available ? onClick : undefined}
		cursor={available ? "pointer" : "not-allowed"}
	>
		<Icon textColor="purple.30" name={icon}></Icon>
		<Box flexGrow="1" flexShrink="1" minWidth="0">
			<Box display="flex" flexDirection="row" justifyContent="space-between">
				<Text fontWeight="bold" size="3" textColor="purple.10">
					{title}
				</Text>
				{!available && (
					<Tooltip
						label="Storing YAML in your app's repository is not available in your current plan."
						shouldWrapChildren
					>
						<Badge filter="none" color="neutral.40" backgroundColor="neutral.90">
							Not available
						</Badge>
					</Tooltip>
				)}
			</Box>
			<Text size="2" textColor="neutral.40">
				{description}
			</Text>
		</Box>
	</Box>
);

export default YmlStorageOption;
