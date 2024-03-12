import { Meta } from "@storybook/react";

import TriggersPage from "./TriggersPage";

export default {
	component: TriggersPage,
	args: {
		pipelineables: ["foo", "bar"],
	},
} as Meta<typeof TriggersPage>;

export const TriggersPageEmptyState = {};

export const TriggerCards = {};
