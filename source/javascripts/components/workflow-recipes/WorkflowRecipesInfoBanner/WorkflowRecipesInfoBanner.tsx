import React, { useState } from "react";
import { ColorButton, Flex, Icon, Link, Text } from "@bitrise/bitkit";

const WorkflowRecipesInfoBannerClosedKey = "workflow-recipes-step-banner-closed";

const WorkflowRecipesInfoBanner = (): JSX.Element => {
	const [isClosed, setClosed] = useState<boolean>(Boolean(localStorage.getItem(WorkflowRecipesInfoBannerClosedKey)));

	const handleClose = (): void => {
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
							<Icon name='Lightbulb' size='24px' />
							<Text size='3' weight='bold' style={{ lineHeight: "16px" }}>Workflow Recipes</Text>
						</Flex>
						<Icon name='CloseSmall' size='24px' textColor='blue-4' style={{ cursor: "pointer" }} onClick={handleClose} />
					</Flex>
					<Text size='3' align='start'>
						Workflow Recipes provide ready-made solutions for common Workflow tasks.{" "}
						Follow the step-by-step guide or simply copy and paste the YML into an existing Workflow.
					</Text>
					<Flex direction='vertical' alignSelf='start'>
						<Link
							id='workflow-editor-step-sidebar-workflow-recipes-link'
							href='https://github.com/bitrise-io/workflow-recipes'
							target='_blank'
							color='grape-3'
						>
							<ColorButton color='blue' size='small'>
								<Text size='2'>Explore Recipes</Text>
								<Icon name='OpenInBrowser' size='24px' />
							</ColorButton>
						</Link>
					</Flex>
				</Flex>
			)}
		</>
	);
};

export default WorkflowRecipesInfoBanner;
