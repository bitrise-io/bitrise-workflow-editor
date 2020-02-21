
export interface Step {
    version: string,
    requestedVersion(): string
    displayName(): string
    isVerified(): boolean,
    isDeprecated(): boolean
    iconURL(): string
}