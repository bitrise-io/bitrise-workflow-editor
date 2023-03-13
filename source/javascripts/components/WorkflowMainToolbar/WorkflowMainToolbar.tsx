import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem } from "@bitrise/bitkit";

import WorkflowRecipesLink from "../workflow-recipes/WorkflowRecipesLink/WorkflowRecipesLink";
import WorkflowSelector, { WorkflowSelectorProps } from "../WorkflowSelector/WorkflowSelector";
import RunWorkflowDialog from "../RunWorkflowDialog/RunWorkflowDialog";
import { useDisclosure } from "@chakra-ui/react";

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
}: WorkflowMainToolbarProps): JSX.Element => {
	const {isOpen, onOpen, onClose} = useDisclosure();

	return (
	<Box display='flex' alignItems="center" justifyContent="space-between">
		<Box display='flex' alignItems='center' gap='8' id="workflow-main-toolbar">
			{selectedWorkflow && (
				<WorkflowSelector
					selectedWorkflow={selectedWorkflow}
					workflows={workflows}
					selectWorkflow={selectWorkflow}
					renameWorkflowConfirmed={renameWorkflowConfirmed}
				/>
			)}
			<IconButton iconName="PlusOpen" variant='secondary' onClick={onAddNewWorkflow} aria-label='Add new Workflow' />
			<Menu placement="bottom-end">
				<MenuButton as={IconButton} variant="secondary" iconName="MoreHorizontal" aria-label="Manage Workflows" />
				<MenuList>
					<MenuItem iconName="ArrowQuit" onClick={onInsertBeforeWorkflow}>Insert Workflow before</MenuItem>
					<MenuItem iconName="ArrowQuit" onClick={onInsertAfterWorkflow}>Insert Workflow after</MenuItem>
					<MenuItem
						iconName="Request"
						isDisabled={selectedWorkflow.workflowChain(workflows).length === 1}
						onClick={onRearrangeWorkflow}
					>
						Change Workflow execution order
					</MenuItem>
					<MenuItem iconName="Trash" onClick={onDeleteSelectedWorkflow} isDanger>Delete selected Workflow</MenuItem>
				</MenuList>
			</Menu>
			<IconButton iconName="Play" aria-label='Start Worklfow' onClick={onOpen}>Run workflow</IconButton>
		</Box>
		<WorkflowRecipesLink linkId='workflow-editor-main-toolbar-workflow-recipes-link' trackingName='main_toolbar' />
		<RunWorkflowDialog isOpen={isOpen} onClose={onClose} />
	</Box>
	);
};

export default WorkflowMainToolbar;
