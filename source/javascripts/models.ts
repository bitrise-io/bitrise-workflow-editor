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

export interface StepInput {
	[key: string]: string | StepInput["opts"];
	opts: {
		category?: string;
		description: string;
		is_dont_change_value: boolean;
		is_expand: boolean;
		is_required: boolean;
		is_sensitive: boolean;
		is_template: boolean;
		skip_if_empty: boolean;
		summary: string;
		title: string;
		unset: boolean;
	};
}

export interface Step {
	id: string;
	cvs: string;
	version: string;
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
	defaultStepConfig: {
		title: string;
		run_if: string;
		version: string;
		inputs: StepInput[];
		is_always_run: boolean;
	};
	userStepConfig: {
		title?: string;
		run_if?: string;
		version?: string;
		inputs?: StepInput[];
		is_always_run?: boolean;
	};
}
