import { Box, Text, Icon, Link, Input } from "@bitrise/bitkit";
import React, { useMemo } from "react";
import { useState } from "react";
import { useCallback } from "react";
import { Workflow } from "../../../models";
import "./WorkflowSelectorItem.scss";

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
	renameWorkflowConfirmed
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
			className={`WorkflowSelectorItem ${isSelected ? "WorkflowSelectorItem_active" : ""} ${
				isEditing ? "WorkflowSelectorItem_editing" : ""
			}`}
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
						className={`WorkflowEditSubmit ${isWorkflowIdValid ? "" : "WorkflowEditSubmit_invalid"}`}
						cursor="pointer"
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
							name={isSelected ? "Tick" : "BuildstatusLoading"}
						/>
					</Box>
					<Box display="flex" flexShrink={1} flexGrow={1} alignItems="center" justifyContent="space-between">
						<Text className="WorkflowSelectorItem--label" overflow="hidden" data-e2e-tag="workflow-selector-item-name">
							{workflowId}
						</Text>
						{isSelected && (
							<Link
								as="button"
								className="WorkflowSelectorItem--rename"
								size="2"
								textTransform="uppercase"
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
