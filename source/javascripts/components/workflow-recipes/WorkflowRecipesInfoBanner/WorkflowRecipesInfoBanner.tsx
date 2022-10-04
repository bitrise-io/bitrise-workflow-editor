import React, { useState } from "react";
import { ColorButton, Flex, Icon, Link, Text } from "@bitrise/bitkit";

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
				<Flex
					direction='vertical'
					gap='x4'
					textColor='blue-4'
					backgroundColor='blue-1'
					borderColor='blue-2'
					borderWidth='x1'
					borderRadius='x1'
					padding='x4'
					style={{ marginBottom: "32px" }}
				>
					<Flex direction='horizontal' alignChildrenVertical='middle' alignChildrenHorizontal='between'>
						<Flex direction='horizontal' gap='x2' alignChildrenVertical='middle'>
							<Icon name='Lightbulb' size='24' />
							<Text size='3' fontWeight='bold' style={{ lineHeight: "16px" }}>Workflow Recipes</Text>
						</Flex>
						<Icon
							id='workflow-editor-step-sidebar-close-workflow-recipes-banner'
							name='CloseSmall'
							size='24px'
							textColor='blue-4'
							style={{ cursor: "pointer" }}
							onClick={handleClose}
						/>
					</Flex>
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
				</Flex>
			)}
		</>
	);
};

export default WorkflowRecipesInfoBanner;
