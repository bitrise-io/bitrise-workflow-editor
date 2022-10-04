<<<<<<< Updated upstream
import React, { useState } from "react";
import { ColorButton, Box, Icon, Link, Text } from "@bitrise/bitkit";
=======
import { useState } from "react";
import { Box, ColorButton, Icon, Link, Text } from "@bitrise/bitkit";
>>>>>>> Stashed changes

import Hotjar from "../../../utils/hotjar";

const WorkflowRecipesInfoBannerClosedKey = "workflow-recipes-step-banner-closed";

const WorkflowRecipesInfoBanner = (): JSX.Element => {
	const [isClosed, setClosed] = useState<boolean>(Boolean(localStorage.getItem(WorkflowRecipesInfoBannerClosedKey)));

	const trackAction = (): void => {
		Hotjar.event("wfe_workflow_recipes_action_step_sidebar");
	}

	const handleClose = (): void => {
		trackAction();
		localStorage.setItem(WorkflowRecipesInfoBannerClosedKey, "true")
		setClosed(true);
	}

	return (
		<>
			{!isClosed && (
				<Box
<<<<<<< Updated upstream
					flexDirection='column'
					gap='16'
					textColor='blue.40'
					backgroundColor='blue-1'
					borderColor='blue.93'
					borderWidth='4'
=======
					display="flex"
					flexDirection="column"
					gap='16'
					textColor='blue.40'
					backgroundColor="blue.93"
					borderColor='blue.70'
					borderWidth='1'
>>>>>>> Stashed changes
					borderRadius='4'
					padding='16'
					marginBottom="32"
				>
<<<<<<< Updated upstream
					<Box flexDirection='row' alignItems='center' justifyContent='space-between'>
							<Flex direction='horizontal' gap='x2' alignChildrenVertical='middle'>
=======
					<Box display="flex" alignItems="center" justifyContent="space-between">
						<Box display='flex' gap='8' alignItems="center">
>>>>>>> Stashed changes
							<Icon name='Lightbulb' size='24' />
							<Text fontWeight='bold' lineHeight="16px">Workflow Recipes</Text>
						</Box>
						<Icon
							id='workflow-editor-step-sidebar-close-workflow-recipes-banner'
							name='CloseSmall'
							size='24'
<<<<<<< Updated upstream
							textColor='blue.40'
=======
							textColor='blue-4'
>>>>>>> Stashed changes
							cursor="pointer"
							onClick={handleClose}
						/>
					</Box>
<<<<<<< Updated upstream
					<Text size='3' align='left'>
						Workflow Recipes provide ready-made solutions for common Workflow tasks.{" "}
						Follow the step-by-step guide or simply copy and paste the YML into an existing Workflow.
					</Text>
					<Flex direction='vertical' alignSelf='start'>
						<Link
							id='workflow-editor-step-sidebar-workflow-recipes-link'
							href='https://github.com/bitrise-io/workflow-recipes'
							target='_blank'
							color='grape-3'
							onClick={trackAction}
						>
							<ColorButton color='blue' size='small'>
								<Text size='2'>Explore Recipes</Text>
								<Icon name='OpenInBrowser' size='24' />
							</ColorButton>
						</Link>
					</Flex>
=======
					<Text textAlign='left'>
						Workflow Recipes provide ready-made solutions for common Workflow tasks.{" "}
						Follow the step-by-step guide or simply copy and paste the YML into an existing Workflow.
					</Text>
					<Link
						id='workflow-editor-step-sidebar-workflow-recipes-link'
						href='https://github.com/bitrise-io/workflow-recipes'
						target='_blank'
						colorScheme="purple"
						onClick={trackAction}
						alignSelf="start"
					>
						<ColorButton color='blue' size='small'>
							<Text size='2'>Explore Recipes</Text>
							<Icon name='OpenInBrowser' size='24' />
						</ColorButton>
					</Link>
>>>>>>> Stashed changes
				</Box>
			)}
		</>
	);
};

export default WorkflowRecipesInfoBanner;
