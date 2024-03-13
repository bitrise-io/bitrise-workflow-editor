export type ConditionType = "push_branch" | "commit_message" | "file_change";

export type Condition = {
	isRegex: boolean;
	type: ConditionType;
	value: string;
    id?: string;
};

export type SourceType = "push" | "pull_request" | "tag"

export type TriggerItem = {
	conditions: Condition[];
	pipelineable: string;
    id: string;
    source: SourceType;
};

export interface FormItems extends Omit<TriggerItem, "conditions"> {
	conditions: {
		isRegex: boolean;
		type?: ConditionType;
		value: string;
	}[];
}