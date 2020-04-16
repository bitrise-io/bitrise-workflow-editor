export interface StepCatalouge {
	steps: Array<Map<string, Record<string, any>>>;
	latestStepVersions: Map<string, Record<string, any>>;
}
export interface Workflow {
	id: string;
	steps: Array<Step>;
}

export interface Step {
	id: string;
	cvs: string;
	version: string;
	requestedVersion(): string;
	displayName(): string;
	isVerified(): boolean;
	isConfigured(): boolean;
	isDeprecated(): boolean;
	isLibraryStep(): boolean;
	iconURL(): string;
}
