import { Box, Button } from "@bitrise/bitkit";

import Hotjar from "../../../utils/hotjar";
import { BoxProps } from "@chakra-ui/react";

type WorkflowRecipesButtonProps = {
	linkId: string;
	trackingName?: string;
} & BoxProps;

const WorkflowRecipesButton = ({ linkId, trackingName, ...boxProps }: WorkflowRecipesButtonProps): JSX.Element => {
	const trackAction = (): void => {
		const eventName = `wfe_workflow_recipes_action_${trackingName}`;
		Hotjar.event(eventName);
	};

	return (
		<Box display="flex" alignItems="center" gap="8" paddingY="4" {...boxProps}>
			<Button id={linkId} as='a' target='_blank' onClick={trackAction}>
				Workflow Recipies with AI
			</Button>
		</Box>
		);
};

export default WorkflowRecipesButton;
