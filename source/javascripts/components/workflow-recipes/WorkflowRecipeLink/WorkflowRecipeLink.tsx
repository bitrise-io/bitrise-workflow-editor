import React from "react";
import { Flex, Icon, Link, Text, Tooltip } from "@bitrise/bitkit";

type WorkflowRecipeLinkProps = {
	id: string;
	hideIcon?: boolean;
}

const WorkflowRecipeLink = ({ id, hideIcon }: WorkflowRecipeLinkProps): JSX.Element => (
	<Flex direction='horizontal' gap='x2' alignChildrenVertical='middle'>
		<Link id={id} href='https://github.com/bitrise-io/workflow-recipes' target='_blank' color='grape-3'>
			<Flex direction='horizontal' gap='x0'>
				{!hideIcon && <Icon name='OpenInBrowser' size='20px' />}
				<Text size='x3'>Workflow Recipes</Text>
			</Flex>
		</Link>
		<Tooltip title='Workflow Recipes provide ready-made solutions for common Workflow tasks.'>
			{({ ref, ...rest }) => (
				<Icon innerRef={ref} name='Support' size='20px' textColor='gray-5' {...rest} />
			)}
		</Tooltip>
	</Flex>
);

export default WorkflowRecipeLink;
