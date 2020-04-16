import { Step, Workflow } from "../models";

interface WorkflowSelectionState {
	lastSelectedWorkflow: Workflow;
	lastEditedWorkflow: Workflow;
	lastEditedWorkflowIndex: number;
	lastSelectedStep: Step;
}

class WorkflowSelectionStore {
	private shouldStoreChanges = false;

	lastSelectedWorkflowID: string|null = null;
	lastEditedWorkflowID: string|null = null;
	lastEditedWorkflowIndex: number|null = null;
	lastSelectedStepCVS: string|null = null;
	lastSelectedStepIndex: number|null = null;

	applyState = ({ lastEditedWorkflow, lastSelectedStep, lastSelectedWorkflow, lastEditedWorkflowIndex }: WorkflowSelectionState): void => {
		if (!this.shouldStoreChanges) {
			return;
		}

		this.lastSelectedWorkflowID = lastSelectedWorkflow?.id;
		this.lastEditedWorkflowID = lastEditedWorkflow?.id;
		this.lastEditedWorkflowIndex = lastEditedWorkflow && lastEditedWorkflowIndex;
		this.lastSelectedStepCVS = lastSelectedStep?.cvs;
		this.lastSelectedStepIndex =
			lastEditedWorkflow && lastSelectedStep ? lastEditedWorkflow.steps.indexOf(lastSelectedStep) : null;
	};

	reset = (): void => {
		this.lastSelectedWorkflowID = null;
		this.lastEditedWorkflowID = null;
		this.lastEditedWorkflowIndex = null;
		this.lastSelectedStepCVS = null;
		this.lastSelectedStepIndex = null;
	};

	enable = (): void => {
		this.shouldStoreChanges = true;
	};

	disable = (): void => {
		this.shouldStoreChanges = false;
	}
}

export default new WorkflowSelectionStore();
