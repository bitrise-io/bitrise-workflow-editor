import {
	Box,
	Button,
	IconButton,
	Link,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Notification,
	Text,
	Tooltip
} from "@bitrise/bitkit";

import WorkflowRecipesLink from "../workflow-recipes/WorkflowRecipesLink/WorkflowRecipesLink";
import WorkflowSelector, { WorkflowSelectorProps } from "../WorkflowSelector/WorkflowSelector";
import { useDisclosure } from "@bitrise/bitkit";
import RunWorkflowDialog from "../RunWorkflowDialog/RunWorkflowDialog";
import { useTrackingFunction } from "../../hooks/utils/useTrackingFunction";

type WorkflowMainToolbarProps = WorkflowSelectorProps & {
	defaultBranch: string;
	uniqueStepCount: number;
	uniqueStepLimit?: number;
	canRunWorkflow: boolean;
	isRunWorkflowDisabled: boolean;
	onAddNewWorkflow: () => void;
	onInsertBeforeWorkflow: () => void;
	onInsertAfterWorkflow: () => void;
	onRearrangeWorkflow: () => void;
	onDeleteSelectedWorkflow: () => void;
	onRunWorkflow: (branch: string) => void;
	organizationSlug?: string;
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
	onRunWorkflow,
	uniqueStepCount,
	uniqueStepLimit,
	organizationSlug,
}: WorkflowMainToolbarProps): JSX.Element => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const showStepLimit = typeof uniqueStepLimit === "number";
	const stepLimitReached = uniqueStepLimit && uniqueStepCount >= uniqueStepLimit;
	const upgradeLink = organizationSlug ?
		`/organization/${organizationSlug}/credit_subscription/plan_selector_page` : undefined;

	const trackDialogOpen = useTrackingFunction(() => ({
		event: "WFE - Run Workflow Dialog Opened",
		payload: {}
	}));

	const handleOpenRunWorkflowDialog = () => {
		trackDialogOpen();
		onOpen();
	};

	return (
		<Box display='flex' flexDirection="column" gap="20">
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
				{showStepLimit &&
					<Text color="neutral.40" marginInlineStart="auto" marginInlineEnd="8">
						{uniqueStepCount}/{uniqueStepLimit} steps used
					</Text>
				}
				<WorkflowRecipesLink
					marginInlineStart={showStepLimit ? undefined : "auto"}
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
			{stepLimitReached && <Notification status="warning">
				<Text size="3" fontWeight="bold">You cannot add a new Step now.</Text>
				Your team has already reached the limit for this app ({uniqueStepLimit} unique Steps per app) included{" "}
				in your current plan. To add more Steps, <Link isUnderlined href={upgradeLink}>upgrade your plan first</Link>.
			</Notification>}
		</Box>
		);
};

export default WorkflowMainToolbar;
