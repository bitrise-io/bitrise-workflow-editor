import merge from "lodash/merge";
import snakeCase from "lodash/snakeCase";

import { Step, StepInput } from "../../models";

export const extractInputNameAndDefaultValue = (obj: Record<string, unknown>) => {
	const entries = Object.entries(obj).filter(([key, value]) => typeof key === "string" && typeof value === "string");

	if (entries.length === 0) {
		return { name: undefined, defaultValue: undefined };
	}

	return { name: entries[0][0], defaultValue: entries[0][1] as string };
};

export const createKey = (...key: (string | number | undefined)[]) => {
	return snakeCase(key.filter(Boolean).join("_"));
};

export const mergeDefaultAndUserStepConfig = (step: Step) => {
	return merge<Step["defaultStepConfig"], Step["userStepConfig"]>(
		JSON.parse(JSON.stringify(step.defaultStepConfig)),
		JSON.parse(JSON.stringify(step.userStepConfig)),
	);
};

export const groupInputsIntoCategories = (inputs: StepInput[]) => {
	return inputs.reduce((result, input) => {
		const key = input.opts.category || "";
		return result.set(key, [...(result.get(key) ?? []), input]);
	}, new Map<string, StepInput[]>());
};
