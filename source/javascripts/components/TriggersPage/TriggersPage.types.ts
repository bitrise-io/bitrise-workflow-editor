export type TagConditionType = "tag"

export type PushConditionType = "push_branch" | "commit_message" | "file_change";

export type PrConditionType = "source_branch" | "target_branch" | "pr_label" | "pr_comment" | "commit_message" | "file_change"

export type Condition = {
	isRegex: boolean;
	type: PushConditionType | TagConditionType;
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
		type?: PushConditionType | PrConditionType | TagConditionType;
		value: string;
	}[];
}