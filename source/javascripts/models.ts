export interface StepCatalouge {
	steps: Array<Map<string, Record<string, unknown>>>;
	latestStepVersions: Map<string, Record<string, unknown>>;
}

export interface Step {
	id: string;
	version: string;
	requestedVersion(): string;
	displayName(): string;
	isVerified(): boolean;
	isConfigured(): boolean;
	isDeprecated(): boolean;
	isLibraryStep(): boolean;
	iconURL(): string;
}
