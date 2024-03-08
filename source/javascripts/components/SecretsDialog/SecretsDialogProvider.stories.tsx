import { Box, Button, Text } from "@bitrise/bitkit";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import SecretsDialogProvider, { useSecretsDialog } from "./SecretsDialogProvider";
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
	component: SecretsDialogProvider,
} as Meta<typeof SecretsDialogProvider>;

export const WithProps: StoryObj<typeof SecretsDialogProvider> = {
	decorators: [
		(Story) => {
			return (
				<SecretsDialogProvider defaultSecrets={defaultSecrets}>
					<Story />
				</SecretsDialogProvider>
			);
		},
	],
	render() {
		const { open } = useSecretsDialog();
		const [secret, setSecret] = useState<Secret>();

		const onOpen = () => {
			open({
				source: "Storybook",
				onCreate: setSecret,
				onSelect: setSecret,
			});
		};

		return (
			<Box display="flex" flexDirection="column" height="100dvh" justifyContent="center" alignItems="center" gap="8">
				<Button onClick={onOpen}>Select secret</Button>
				<Text>{secret?.key ?? "No secret selected!"}</Text>
			</Box>
		);
	},
};
