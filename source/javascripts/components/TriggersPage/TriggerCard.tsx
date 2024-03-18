import { Box, Card, Checkbox, Icon, IconButton, Tag, Text, TypeIconName } from "@bitrise/bitkit";
import { Tooltip } from "@chakra-ui/react";
import { Fragment } from "react";

import { PrConditionType, PushConditionType, TagConditionType, TriggerItem } from "./TriggersPage.types";

type TriggerCardProps = {
	triggerItem: TriggerItem;
	onRemove: (triggerItem: TriggerItem) => void;
	onEdit: (triggerItem: TriggerItem) => void;
	onActiveChange: (triggerItem: TriggerItem) => void;
};

const iconMap: Record<PushConditionType | PrConditionType | TagConditionType, TypeIconName> = {
	push_branch: "Branch",
	commit_message: "Commit",
	changed_files: "Doc",
	pull_request_source_branch: "Pull",
	pull_request_target_branch: "Pull",
	pull_request_label: "Tag",
	pull_request_comment: "Chat",
	tag: "Tag",
};

const toolTip: Record<PushConditionType | PrConditionType | TagConditionType, string> = {
	push_branch: "Push branch",
	commit_message: "Commit message",
	changed_files: "File change",
	pull_request_source_branch: "Source branch",
	pull_request_target_branch: "Target branch",
	pull_request_label: "PR label",
	pull_request_comment: "PR comment",
	tag: "Tag",
};

const TriggerCard = (props: TriggerCardProps) => {
	const { triggerItem, onRemove, onEdit, onActiveChange } = props;
	const { conditions, pipelineable, isDraftPr, isActive } = triggerItem;

	const handleRemove = () => {
		onRemove(triggerItem);
	};

	const handleEdit = () => {
		onEdit(triggerItem);
	};
	//
	return (
		<Card display="flex" justifyContent="space-between" marginBottom="12" padding="16px 24px">
			<Box width="calc((100% - 190px) / 2)" display="flex" flexDir="column" gap="4">
				<Text textStyle="body/md/semibold">Trigger conditions</Text>
				<Box display="flex" alignItems="center" flexWrap="wrap" gap="8px 0">
					{conditions.map(({ type, value }, index) =>
						index > 0 ? (
							<Fragment key={type + value}>
								<Box as="span" mx={4}>
									+
								</Box>
								<Tooltip label={toolTip[type]}>
									<Tag iconName={iconMap[type]} iconColor="neutral.50">
										{value}
									</Tag>
								</Tooltip>
							</Fragment>
						) : (
							<Fragment key={type + value}>
								<Tooltip label={toolTip[type]}>
									<Tag iconName={iconMap[type]} iconColor="neutral.50">
										{value}
									</Tag>
								</Tooltip>
							</Fragment>
						),
					)}
				</Box>
				{isDraftPr && (
					<Text textStyle="body/md/regular" color="text/tertiary">
						Draft PRs excluded
					</Text>
				)}
			</Box>
			<Box width="calc((100% - 190px) / 2)" display="flex" alignItems="center">
				<Icon name="ArrowRight" marginRight="16" />
				<Box display="flex" flexDir="column" gap="4">
					<Text textStyle="body/md/semibold">Start build</Text>
					<Text>{pipelineable}</Text>
				</Box>
			</Box>
			<Box display="flex" alignItems="center">
				<Checkbox
					marginRight="16"
					isChecked={isActive}
					onChange={() => onActiveChange({ ...triggerItem, isActive: !isActive })}
				>
					Active
				</Checkbox>
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
