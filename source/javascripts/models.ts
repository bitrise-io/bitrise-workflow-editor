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

export type OnStepChange = (values: Partial<Record<string, unknown>>) => void;
export type StepVersionWithRemark = { version: string; remark: string };

export interface Step {
	$$hashKey: string;
	id: string;
	cvs: string;
	version: string;

	defaultStepConfig: {
		version: string;
		source_code_url: string;
		inputs: Array<object>;
	};

	description: GetterSetter<string>;
	displayName: GetterSetter<string>;
	displayTooltip: GetterSetter<string>;
	iconURL: GetterSetter<string>;
	isAlwaysRun: GetterSetter<boolean>;
	isConfigured: GetterSetter<boolean>;
	isDeprecated: GetterSetter<boolean>;
	isLibraryStep: GetterSetter<boolean>;
	isOfficial: GetterSetter<boolean>;
	isVerified: GetterSetter<boolean>;
	requestedVersion: GetterSetter<string | null>;
	runIf: GetterSetter<string>;
	sourceURL: GetterSetter<string>;
	summary: GetterSetter<string>;
}

export interface StepOutputVariable {
	key: string;
	title?: string;
	summary?: string;
	description?: string;
}

export interface Variable {
	description: GetterSetter<string>;
	isDontChangeValue: GetterSetter<boolean>;
	isRequired: GetterSetter<boolean>;
	isSensitive: GetterSetter<boolean>;
	key: GetterSetter<string>;
	summary: GetterSetter<string>;
	title: GetterSetter<string>;
	value: GetterSetter<string>;
	valueOptions: GetterSetter<string[] | undefined>;
}

export interface InputCategory {
	name: string;
	inputs: Variable[];
}
