import React from "react";
import { Flex, Icon, Link, Text, Tooltip } from "@bitrise/bitkit";

type WorkflowRecipesLinkProps = {
	id: string;
}

const WorkflowRecipesLink = ({ id }: WorkflowRecipesLinkProps): JSX.Element => (
	<Flex direction='horizontal' gap='x2' alignChildrenVertical='middle' paddingVertical="x1">
		<Link id={id} href='https://github.com/bitrise-io/workflow-recipes' target='_blank' color='grape-3'>
			<Flex direction='horizontal' gap='x0'>
				<Icon name='OpenInBrowser' size='20px' />
				<Text size='3'>Workflow Recipes</Text>
			</Flex>
		</Link>
		<Tooltip title={<>Workflow Recipes provide ready-made<br/> solutions for common Workflow tasks.</>}>
			{({ ref, ...rest }) => (
				<Icon innerRef={ref} name='Support' size='20px' textColor='gray-5' {...rest} />
			)}
		</Tooltip>
	</Flex>
);

export default WorkflowRecipesLink;
