import { Box, Card, Checkbox, Icon, IconButton, Link, Notification, Tag, Text, TypeIconName } from "@bitrise/bitkit";
import { ConditionType, TriggerItem } from "./TriggersPage.types";

type TriggerCardProps = TriggerItem;

const iconMap: Record<ConditionType, TypeIconName> = {
	push_branch: "Branch",
	commit_message: "Commit",
	file_change: "Doc",
};

const TriggerCard = (props: TriggerCardProps) => {
	const { conditions, pipelineable } = props;

	return (
		<Card display="flex" justifyContent="space-between" alignItems="center" marginBottom="12">
			<Box>
				<Text textStyle="body/md/semibold">Trigger conditions</Text>
				{conditions.map(({ type, value }) => (
					<Tag iconName={iconMap[type]} iconColor="neutral.50">
						{value}
					</Tag>
				))}
			</Box>
			<Box display="flex">
				<Icon name="ArrowRight" marginRight="16" />
				<Text textStyle="body/md/semibold">Start build</Text>
				<Text>{pipelineable}</Text>
			</Box>
			<Box display="flex" alignItems="center">
				<Checkbox>Active</Checkbox>
				<IconButton iconName="Pencil" aria-label="Edit trigger" variant="tertiary" />
				<IconButton iconName="MinusRemove" aria-label="Remove trigger" variant="tertiary" isDanger />
			</Box>
		</Card>
	);
};

export default TriggerCard;
