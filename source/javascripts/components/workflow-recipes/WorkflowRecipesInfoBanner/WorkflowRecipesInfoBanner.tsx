import { Box, ColorButton, Icon, Link, Text } from "@bitrise/bitkit";
import { useState } from "react";

import Hotjar from "../../../utils/hotjar";

const WorkflowRecipesInfoBannerClosedKey = "workflow-recipes-step-banner-closed";

const WorkflowRecipesInfoBanner = (): JSX.Element => {
	const [isClosed, setClosed] = useState<boolean>(Boolean(localStorage.getItem(WorkflowRecipesInfoBannerClosedKey)));

	const trackAction = (): void => {
		Hotjar.event("wfe_workflow_recipes_action_step_sidebar");
	};

	const handleClose = (): void => {
		trackAction();
		localStorage.setItem(WorkflowRecipesInfoBannerClosedKey, "true");
		setClosed(true);
	};

	return (
		<>
			{!isClosed && (
				<Box
					display="flex"
					flexDirection="column"
					gap="16"
					textColor="blue.40"
					backgroundColor="blue.93"
					borderColor="blue.70"
					borderWidth="1"
					borderRadius="4"
					padding="16"
					marginBottom="32"
				>
					<Box display="flex" alignItems="center" justifyContent="space-between">
						<Box display="flex" gap="8" alignItems="center">
							<Icon name="Lightbulb" size="24" />
							<Text fontWeight="bold" lineHeight="16px">
								Workflow Recipes
							</Text>
						</Box>
						<Icon
							id="workflow-editor-step-sidebar-close-workflow-recipes-banner"
							name="CloseSmall"
							size="24"
							textColor="blue.40"
							cursor="pointer"
							onClick={handleClose}
						/>
					</Box>
					<Text textAlign="left">
						Workflow Recipes provide ready-made solutions for common Workflow tasks. Follow the step-by-step guide or
						simply copy and paste the YML into an existing Workflow.
					</Text>
					<Link
						id="workflow-editor-step-sidebar-workflow-recipes-link"
						href="https://github.com/bitrise-io/workflow-recipes"
						target="_blank"
						colorScheme="purple"
						onClick={trackAction}
						alignSelf="start"
					>
						<ColorButton color="blue" size="small">
							<Text size="2">Explore Recipes</Text>
							<Icon name="OpenInBrowser" size="24" />
						</ColorButton>
					</Link>
				</Box>
			)}
		</>
	);
};

export default WorkflowRecipesInfoBanner;
