export type Secret = {
	key: string;
	value: string;
	source: string;
	isExpand: boolean;
	isExpose: boolean;
};

export type SelectSecretFormValues = { key: string };
export type CreateSecretFormValues = Secret;
