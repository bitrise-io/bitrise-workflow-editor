import { Meta, StoryObj } from "@storybook/react";

import EnvironmentVariablesDialog from "./EnvironmentVariablesDialog";
import { EnvironmentVariable } from "./types";

const defaultEnvironmentVariables: EnvironmentVariable[] = [
	{
		source: "Bitrise.io",
		key: "BITRISE_APP_SLUG",
		value: "7ce75f61-556f-4163-8a5f-a9b16ef55a8",
		isExpand: true,
	},
	{
		source: "Bitrise.io",
		key: "BITRISE_BUILD_URL",
		value: "https://app.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8",
		isExpand: true,
	},
	{
		source: "Bitrise.io",
		key: "REPOSITORY_URL",
		value: "git@github.com:flutter/flutter.git",
		isExpand: true,
	},
];

export default {
	component: EnvironmentVariablesDialog,
	argTypes: {
		isOpen: { type: "boolean" },
		onClose: { action: "onClose" },
		onSelect: { action: "onSelect" },
		environmentVariables: { type: "symbol" },
	},
} as Meta<typeof EnvironmentVariablesDialog>;

export const WithProps: StoryObj<typeof EnvironmentVariablesDialog> = {
	args: {
		isOpen: true,
		environmentVariables: defaultEnvironmentVariables,
	},
};
