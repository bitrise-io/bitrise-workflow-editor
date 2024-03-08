import { Meta, StoryObj } from "@storybook/react";

import SecretsDialog from "./SecretsDialog";
import { Secret } from "./types";

const defaultSecrets: Secret[] = [
	{
		source: "Bitrise.io",
		key: "$BITRISE_APP_SLUG",
		value: "7ce75f61-556f-4163-8a5f-a9b16ef55a8",
		isExpand: true,
		isExpose: true,
	},
	{
		source: "Bitrise.io",
		key: "$BITRISE_BUILD_URL",
		value: "https://app.bitrise.io/build/7ce75f61-556f-4163-8a5f-a9b16ef55a8",
		isExpand: true,
		isExpose: true,
	},
	{
		source: "Bitrise.io",
		key: "$REPOSITORY_URL",
		value: "git@github.com:flutter/flutter.git",
		isExpand: true,
		isExpose: true,
	},
];

export default {
	component: SecretsDialog,
	argTypes: {
		source: { type: "string" },
		isOpen: { type: "boolean" },
		secrets: { type: "symbol" },
		onClose: { action: "onClose" },
		onSelect: { action: "onSelect" },
		onCreate: { action: "onCreate" },
	},
} as Meta<typeof SecretsDialog>;

export const WithProps: StoryObj<typeof SecretsDialog> = {
	args: {
		isOpen: true,
		source: "Storybook",
		secrets: defaultSecrets,
	},
};
