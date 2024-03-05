export type GetterSetter<T> = (value?: T) => T;
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

export interface Step {
	$$hashKey: string;
	id: string;
	cvs: string;
	version: string;
	defaultStepConfig: { version: string };

	runIf: GetterSetter<string>;
	isAlwaysRun: GetterSetter<boolean>;
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
}

export interface StepOutputVariable {
	key: string;
	title?: string;
	summary?: string;
	description?: string;
}

export interface Variable {
	key: GetterSetter<string>;
	title: GetterSetter<string>;
	value: GetterSetter<string>;
	isRequired: GetterSetter<boolean>;
	isSensitive: GetterSetter<boolean>;
	isDontChangeValue: GetterSetter<boolean>;
	valueOptions: GetterSetter<string[] | undefined>;
}

export interface InputCategory {
	name: string;
	inputs: Variable[];
}
