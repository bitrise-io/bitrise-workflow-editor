import { Box, Button, IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip } from "@bitrise/bitkit";

import WorkflowRecipesLink from "../workflow-recipes/WorkflowRecipesLink/WorkflowRecipesLink";
import WorkflowSelector, { WorkflowSelectorProps } from "../WorkflowSelector/WorkflowSelector";
import { useDisclosure } from "@chakra-ui/react";
import RunWorkflowDialog from "../RunWorkflowDialog/RunWorkflowDialog";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";

type WorkflowMainToolbarProps = WorkflowSelectorProps & {
	defaultBranch: string;
	canRunWorkflow: boolean;
	isRunWorkflowDisabled: boolean;
	onAddNewWorkflow: () => void;
	onInsertBeforeWorkflow: () => void;
	onInsertAfterWorkflow: () => void;
	onRearrangeWorkflow: () => void;
	onDeleteSelectedWorkflow: () => void;
	onRunWorkflow: (branch: string) => void;
};

const WorkflowMainToolbar = ({
	defaultBranch,
	canRunWorkflow,
	isRunWorkflowDisabled,
	selectedWorkflow,
	workflows,
	selectWorkflow,
	renameWorkflowConfirmed,
	onAddNewWorkflow,
	onInsertBeforeWorkflow,
	onInsertAfterWorkflow,
	onRearrangeWorkflow,
	onDeleteSelectedWorkflow,
	onRunWorkflow
}: WorkflowMainToolbarProps): JSX.Element => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const trackDialogOpen = useTrackingFunction(() => ({
		event: "WFE - Run Workflow Dialog Opened",
		payload: {}
	}));

	const handleOpenRunWorkflowDialog = () => {
		trackDialogOpen();
		onOpen();
	};

	return (
		<Box display='flex' alignItems="center" justifyContent="space-between">
		<Box display="flex" alignItems="center" gap="8" id='workflow-main-toolbar'>
				{selectedWorkflow && (
					<WorkflowSelector
						selectedWorkflow={selectedWorkflow}
						workflows={workflows}
						selectWorkflow={selectWorkflow}
						renameWorkflowConfirmed={renameWorkflowConfirmed}
					/>
				)}
				<IconButton iconName="PlusOpen" variant="secondary" onClick={onAddNewWorkflow} aria-label="Add new Workflow" />
				<Menu placement="bottom-end">
					<MenuButton as={IconButton} variant="secondary" iconName="MoreHorizontal" aria-label="Manage Workflows" />
					<MenuList>
						<MenuItem iconName="ArrowQuit" onClick={onInsertBeforeWorkflow}>
							Insert Workflow before
						</MenuItem>
						<MenuItem iconName="ArrowQuit" onClick={onInsertAfterWorkflow}>
							Insert Workflow after
						</MenuItem>
						<MenuItem
							iconName="Request"
							isDisabled={selectedWorkflow.workflowChain(workflows).length === 1}
							onClick={onRearrangeWorkflow}
						>
							Change Workflow execution order
						</MenuItem>
						<MenuItem iconName="Trash" onClick={onDeleteSelectedWorkflow} isDanger>
							Delete selected Workflow
						</MenuItem>
					</MenuList>
				</Menu>
			</Box>
			<WorkflowRecipesLink
				marginInlineStart="auto"
				linkId="workflow-editor-main-toolbar-workflow-recipes-link"
				trackingName="main_toolbar"
			/>
			{canRunWorkflow && (
				<Tooltip label={isRunWorkflowDisabled ? "Save this Workflow first" : undefined}>
					<Button
						aria-label="Run Workflow"
						marginInlineStart="8"
						rightIconName="OpenInBrowser"
						isDisabled={isRunWorkflowDisabled}
						onClick={handleOpenRunWorkflowDialog}
					>
						Run Workflow
					</Button>
				</Tooltip>
			)}
			<RunWorkflowDialog
				workflow={selectedWorkflow.id}
				isOpen={isOpen}
				onClose={onClose}
				defaultBranch={defaultBranch}
				onAction={branch => onRunWorkflow(branch)}
			/>
		</Box>
	);
};

export default WorkflowMainToolbar;
