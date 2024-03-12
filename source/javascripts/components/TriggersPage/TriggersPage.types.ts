export type ConditionType = "push_branch" | "commit_message" | "file_change";

export type Condition = {
	isRegex: boolean;
	type: ConditionType;
	value: string;
};

export type TriggerItem = {
	conditions: Condition[];
	pipelineable: string;
    id: string;
};
