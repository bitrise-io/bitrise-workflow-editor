import React from "react";
import { Base, Button, ButtonWithDropdown, Flex, Icon, Tooltip } from "@bitrise/bitkit";

import WorkflowRecipesLink from "../workflow-recipes/WorkflowRecipesLink/WorkflowRecipesLink";
import WorkflowSelector, { WorkflowSelectorProps } from "../WorkflowSelector/WorkflowSelector";

type WorkflowMainToolbarProps = WorkflowSelectorProps & {
	onAddNewWorkflow: () => void;
	onInsertBeforeWorkflow: () => void;
	onInsertAfterWorkflow: () => void;
	onRearrangeWorkflow: () => void;
	onDeleteSelectedWorkflow: () => void;
}

const WorkflowMainToolbar = ({
	selectedWorkflow,
	workflows,
	selectWorkflow,
	renameWorkflowConfirmed,
	onAddNewWorkflow,
	onInsertBeforeWorkflow,
	onInsertAfterWorkflow,
	onRearrangeWorkflow,
	onDeleteSelectedWorkflow
}: WorkflowMainToolbarProps): JSX.Element => (
	<Flex direction='horizontal' alignChildrenVertical='middle' alignChildrenHorizontal='between' wrap>
		<Flex direction='horizontal' alignChildrenVertical='middle' gap='x2'>
			{selectedWorkflow && (
				<WorkflowSelector
					selectedWorkflow={selectedWorkflow}
					workflows={workflows}
					selectWorkflow={selectWorkflow}
					renameWorkflowConfirmed={renameWorkflowConfirmed}
				/>
			)}
			<Tooltip title='Add new Workflow'>
				{({ ref, ...rest }) => (
					<Button innerRef={ref} level='secondary' onClick={onAddNewWorkflow} aria-label='Add new Workflow' {...rest}>
						<Icon name='PlusOpen' size='24px' />
					</Button>
				)}
			</Tooltip>
			<Tooltip title='Manage Workflows'>
				{({ ref, ...rest }) => (
					<Base innerRef={ref} {...rest}>
						<ButtonWithDropdown buttonProps={{ "aria-label": "Manage Workflows" }} dropdownWidth='280px' items={[{
							text: "Insert Workflow before",
							icon: "ArrowQuit",
							className: "manage-button add-before-run-workflow",
							onClick: onInsertBeforeWorkflow,
						}, {
							text: "Insert Workflow after",
							icon: "ArrowQuit",
							className: "manage-button add-after-run-workflow",
							onClick: onInsertAfterWorkflow,
						}, {
							text: "Rearrange Workflows",
							icon: "Request",
							className: "manage-button rearrange",
							onClick: onRearrangeWorkflow,
						}, {
							text: "Delete selected Workflow",
							icon: "Trash",
							className: "manage-button delete-workflow",
							onClick: onDeleteSelectedWorkflow,
						}]}>
							<Icon name='More' size='24px' />
						</ButtonWithDropdown>
					</Base>
				)}
			</Tooltip>
		</Flex>
		<Flex direction='horizontal' alignChildrenVertical='middle' paddingVertical='x2'>
			<WorkflowRecipesLink linkId='workflow-editor-main-toolbar-workflow-recipes-link' />
		</Flex>
	</Flex>
);

export default WorkflowMainToolbar;
