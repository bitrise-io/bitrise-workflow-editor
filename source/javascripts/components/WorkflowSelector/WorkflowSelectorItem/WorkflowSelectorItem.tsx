import { Text, Icon, Flex, Input } from "@bitrise/bitkit";
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
		<Flex
			minHeight="49px"
			className={`WorkflowSelectorItem ${isSelected ? "WorkflowSelectorItem_active" : ""} ${
				isEditing ? "WorkflowSelectorItem_editing" : ""
			}`}
			alignChildrenVertical="middle"
			direction="horizontal"
			padding={isEditing ? "x0" : "x3"}
			clickable={!isSelected}
			onClick={onClick}
			data-e2e-tag={`workflow-selector-option-${workflow.id}`}
		>
			{isEditing ? (
				<Flex direction="horizontal" alignChildrenVertical="middle" grow>
					<Flex paddingHorizontal="x4" direction="horizontal" alignChildrenVertical="middle" grow>
						<Input
							autoFocus
							value={workflowId}
							onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setWorkflowId(ev.target.value)}
							data-e2e-tag="workflow-selector-item-name-input"
						/>
					</Flex>
					<Flex
						className={`WorkflowEditSubmit ${isWorkflowIdValid ? "" : "WorkflowEditSubmit_invalid"}`}
						clickable={isWorkflowIdValid}
						direction="horizontal"
						alignChildren="middle"
						padding="x3"
						onClick={onRenameConfirm}
						data-e2e-tag="workflow-selector-item-name-edit-submit"
					>
						<Icon size="1.5rem" name="Tick" />
					</Flex>
				</Flex>
			) : (
				<>
					<Flex width="36px" direction="horizontal" alignChildren="middle">
						<Icon size={isSelected ? "1.25rem" : ".75rem"} name={isSelected ? "Tick" : "BuildstatusLoadingeeehh"} />
					</Flex>
					<Flex shrink grow direction="horizontal" alignChildrenHorizontal="between" alignChildrenVertical="middle">
						<Text className="WorkflowSelectorItem--label" overflow="hidden" data-e2e-tag="workflow-selector-item-name">
							{workflowId}
						</Text>
						{isSelected && (
							<Text
								clickable
								className="WorkflowSelectorItem--rename"
								config="8"
								uppercase
								onClick={onRenameClick}
								data-e2e-tag="workflow-selector-item-name-edit-trigger"
							>
								Rename
							</Text>
						)}
					</Flex>
				</>
			)}
		</Flex>
	);
};

export default WorkflowSelectorItem;
