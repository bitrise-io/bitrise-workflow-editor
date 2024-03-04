import React from "react";
import type { Preview } from "@storybook/react";
import {Provider} from '@bitrise/bitkit'

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	decorators: [
		(Story) => (
		<Provider>
			<Story />
		</Provider>
		),
	],
};

export default preview
