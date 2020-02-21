
export interface StepCatalouge {
    steps: Array<Map<string, Object>>
    latestStepVersions: Map<string, Object>
};

export interface Step {
    id: string,
    version: string,
    requestedVersion(): string
    displayName(): string
    isVerified(): boolean,
    isDeprecated(): boolean
    iconURL(): string
};