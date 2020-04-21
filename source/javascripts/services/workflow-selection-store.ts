import { Step, Workflow } from "../models";
import { WfChainWrapper } from "./workflows-selection-service";

type WorkflowSelectionState = {
	lastSelectedWorkflow?: Workflow;
	lastEditedWorkflow?: Workflow;
	lastEditedWorkflowIndex?: number;
	lastSelectedStep?: Step;
};

export class WorkflowSelectionStore {
	private shouldStoreChanges = false;

	lastSelectedWorkflowID: string | null = null;
	lastEditedWorkflowID: string | null = null;
	lastEditedWorkflowIndex: number | null = null;
	lastSelectedStepCVS: string | null = null;
	lastSelectedStepIndex: number | null = null;

	applyState = ({
		lastEditedWorkflow,
		lastSelectedStep,
		lastSelectedWorkflow,
		lastEditedWorkflowIndex
	}: WorkflowSelectionState): void => {
		if (!this.shouldStoreChanges) {
			return;
		}

		if (lastSelectedWorkflow) {
			this.lastSelectedWorkflowID = lastSelectedWorkflow.id;
		}

		if (lastEditedWorkflow && lastEditedWorkflowIndex) {
			this.lastEditedWorkflowID = lastEditedWorkflow.id;
			this.lastEditedWorkflowIndex = lastEditedWorkflowIndex;
		}

		if (lastSelectedStep) {
			this.lastSelectedStepCVS = lastSelectedStep.cvs;
		}

		if (lastEditedWorkflow && lastSelectedStep) {
			this.lastSelectedStepIndex = lastEditedWorkflow.steps.indexOf(lastSelectedStep);
		}
	};

	checkLastSelectedWorkflow = (workflow: WfChainWrapper): boolean => {
		return workflow.workflow?.id === this.lastEditedWorkflowID;
	};

	checkLastSelectedstep = (step: Step): boolean => {
		return step.cvs === this.lastSelectedStepCVS;
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
	};
}

export default new WorkflowSelectionStore();
