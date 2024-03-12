import { Box, Card, Checkbox, Icon, IconButton, Tag, Text, TypeIconName } from "@bitrise/bitkit";

import { ConditionType, TriggerItem } from "./TriggersPage.types";

type TriggerCardProps = {
	triggerItem: TriggerItem;
	onRemove: (triggerItem: TriggerItem) => void;
	onEdit: (triggerItem: TriggerItem) => void;
};

const iconMap: Record<ConditionType, TypeIconName> = {
	push_branch: "Branch",
	commit_message: "Commit",
	file_change: "Doc",
};

const TriggerCard = (props: TriggerCardProps) => {
	const { triggerItem, onRemove, onEdit } = props;
	const { conditions, pipelineable } = triggerItem;

	const handleRemove = () => {
		onRemove(triggerItem);
	};

	const handleEdit = () => {
		onEdit(triggerItem);
	};

	return (
		<Card display="flex" justifyContent="space-between" marginBottom="12" padding="16px 24px">
			<Box display="flex" flexDir="column" gap="4">
				<Text textStyle="body/md/semibold">Trigger conditions</Text>
				{conditions.map(({ type, value }) => (
					<Tag key={type + value} iconName={iconMap[type]} iconColor="neutral.50">
						{value}
					</Tag>
				))}
			</Box>
			<Box display="flex" alignItems="center">
				<Icon name="ArrowRight" marginRight="16" />
				<Box display="flex" flexDir="column" gap="4">
					<Text textStyle="body/md/semibold">Start build</Text>
					<Text>{pipelineable}</Text>
				</Box>
			</Box>
			<Box display="flex" alignItems="center">
				<Checkbox marginRight="16">Active</Checkbox>
				<IconButton iconName="Pencil" aria-label="Edit trigger" variant="tertiary" onClick={handleEdit} />
				<IconButton
					iconName="MinusRemove"
					aria-label="Remove trigger"
					variant="tertiary"
					isDanger
					onClick={handleRemove}
				/>
			</Box>
		</Card>
	);
};

export default TriggerCard;
