export interface StepCatalouge {
	steps: Record<string, Map<string, Record<string, any>>>;
	latestStepVersions: Record<string, string>;
}

export interface Workflow {
	id: string;
	steps: Array<Step>;
	beforeRunWorkflows: (arg0: Array<Workflow>) => Array<Workflow>;
	afterRunWorkflows: (arg0: Array<Workflow>) => Array<Workflow>;
	workflowChain: (arg0: Array<Workflow>) => Array<Workflow>;
}

export type OnStepPropertyChange = (values: Record<"name" | "version", string>) => void;
export type OnStepVersionUpgrade = (step: Step, index: number) => void;
export type OnStepVersionChange = (selectedVersion: string) => void;
export type StepVersionWithRemark = { version: string; remark: string };

export interface Step {
	id: string;
	cvs: string;
	version: string;
	defaultStepConfig: {
		version: string;
	};

	requestedVersion(): string;

	displayName(): string;

	displayTooltip(): string;

	isVerified(): boolean;

	isOfficial(): boolean;

	isConfigured(): boolean;

	isDeprecated(): boolean;

	isLibraryStep(): boolean;

	iconURL(): string;

	summary(): string;

	description(): string;

	sourceURL(): string;
}

export interface StepOutputVariable {
	key: string;
	title?: string;
	summary?: string;
	description?: string;
}
