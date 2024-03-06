import { Box, Icon, Input, Link, Text } from "@bitrise/bitkit";
import React, { useMemo } from "react";
import { useState } from "react";
import { useCallback } from "react";

import { Workflow } from "../../../models";

interface WorkflowSelectorItemProps {
	selectedWorkflowId: string;
	workflow: Workflow;
	selectWorkflow: (workflow: Workflow) => void;
	renameWorkflowConfirmed: (workflow: Workflow, newWorkflowID: string) => void;
	workflowIds: string[];
}

const nameValidator = new RegExp("^[A-Za-z0-9-_.]+$");

const WorkflowSelectorItem: React.FC<WorkflowSelectorItemProps> = ({
	selectedWorkflowId,
	workflow,
	selectWorkflow,
	workflowIds,
	renameWorkflowConfirmed,
}: WorkflowSelectorItemProps) => {
	const [workflowId, setWorkflowId] = useState(workflow.id);
	const [isEditing, setIsEditing] = useState(false);

	const isSelected = useMemo(() => selectedWorkflowId === workflow.id, [selectedWorkflowId, workflow]);

	const onClick = useCallback(() => {
		if (!isSelected) {
			selectWorkflow(workflow);
		}
	}, [selectWorkflow, workflow]);

	const onRenameClick = (): void => {
		setTimeout(() => setIsEditing(true), 0);
	};

	const isWorkflowIdValid = useMemo((): boolean => {
		if (workflowId === workflow.id) {
			return true;
		}
		return !!workflowId.length && workflowIds.indexOf(workflowId) === -1 && nameValidator.test(workflowId);
	}, [workflowId]);

	const onRenameConfirm = useCallback(() => {
		renameWorkflowConfirmed(workflow, workflowId);
		setTimeout(() => setIsEditing(false), 0);
	}, [workflow, workflowId]);

	return (
		<Box
			display="flex"
			minHeight="49px"
			borderTop="1px solid"
			borderTopColor="separator.primary"
			bg={isSelected && !isEditing ? "purple.40" : undefined}
			color={isSelected && !isEditing ? "neutral.100" : undefined}
			_hover={{ background: !isEditing ? "purple.40" : undefined, color: !isEditing ? "neutral.100" : undefined }}
			alignItems="center"
			padding={isEditing ? "0" : "12"}
			cursor={isSelected ? "default" : "pointer"}
			onClick={onClick}
			data-e2e-tag={`workflow-selector-option-${workflow.id}`}
		>
			{isEditing ? (
				<Box display="flex" alignItems="center" flexGrow={1}>
					<Input
						autoFocus
						value={workflowId}
						onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setWorkflowId(ev.target.value)}
						data-e2e-tag="workflow-selector-item-name-input"
						flexGrow={1}
						marginX="16"
					/>
					<Box
						color="neutral.100"
						background={!isWorkflowIdValid ? "red.50" : "purple.40"}
						cursor={!isWorkflowIdValid ? "not-allowed" : "pointer"}
						padding="12"
						onClick={onRenameConfirm}
						data-e2e-tag="workflow-selector-item-name-edit-submit"
					>
						<Icon width="20px" height="20px" name="Tick" />
					</Box>
				</Box>
			) : (
				<>
					<Box display="flex" width="36px" justifyContent="center" alignItems="center">
						<Icon
							width={isSelected ? "1.25rem" : ".75rem"}
							height={isSelected ? "1.25rem" : ".75rem"}
							name={isSelected ? "Tick" : "BuildstatusNeverbuilt"}
						/>
					</Box>
					<Box display="flex" flexShrink={1} flexGrow={1} alignItems="center" justifyContent="space-between">
						<Text
							whiteSpace="normal"
							wordBreak="break-word"
							paddingRight="12"
							overflow="hidden"
							data-e2e-tag="workflow-selector-item-name"
						>
							{workflowId}
						</Text>
						{isSelected && (
							<Link
								as="button"
								className="WorkflowSelectorItem--rename"
								size="2"
								textTransform="uppercase"
								_hover={{ textDecoration: "underline" }}
								onClick={onRenameClick}
								data-e2e-tag="workflow-selector-item-name-edit-trigger"
							>
								Rename
							</Link>
						)}
					</Box>
				</>
			)}
		</Box>
	);
};

export default WorkflowSelectorItem;
