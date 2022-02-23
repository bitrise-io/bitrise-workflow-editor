import React from "react";
import { Flex, Icon, Link, Text, Tooltip } from "@bitrise/bitkit";

import Hotjar from "../../../utils/hotjar";

type WorkflowRecipesLinkProps = {
	linkId: string;
	trackingName?: string;
};

const WorkflowRecipesLink = ({ linkId, trackingName }: WorkflowRecipesLinkProps): JSX.Element => {
	const trackAction = (): void => {
			const eventName = `wfe_workflow_recipes_action_${trackingName}`;
			Hotjar.event(eventName);
	}

	return (
		<Flex direction="horizontal" gap="x2" alignChildrenVertical="middle" paddingVertical="x1">
			<Link
				id={linkId}
				href="https://github.com/bitrise-io/workflow-recipes"
				target="_blank"
				color="grape-3"
				onClick={trackAction}
			>
				<Flex direction="horizontal" gap="x1">
					<Icon name="OpenInBrowser" size="20px" />
					<Text size="3">Workflow Recipes</Text>
				</Flex>
			</Link>
			<Tooltip
				title={
					<>
						Workflow Recipes provide ready-made
						<br /> solutions for common Workflow tasks.
					</>
				}
			>
				{({ ref, ...rest }) => <Icon innerRef={ref} name="Support" size="20px" textColor="gray-5" {...rest} />}
			</Tooltip>
		</Flex>
	);
};

export default WorkflowRecipesLink;
