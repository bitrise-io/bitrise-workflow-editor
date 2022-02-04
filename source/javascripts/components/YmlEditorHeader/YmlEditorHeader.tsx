import React  from "react";
import { Button, Flex, Text } from "@bitrise/bitkit";
import { useMediaQuery } from "@bitrise/bitkit/lib/esn/hooks";

import WorkflowRecipesLink from "../workflow-recipes/WorkflowRecipesLink/WorkflowRecipesLink";

type YmlEditorHeaderProps = {
	url: string;
	usesRepositoryYml?: boolean;
}
const YmlEditorHeader = ({ url, usesRepositoryYml}: YmlEditorHeaderProps) => {
	const match = useMediaQuery(["848px"]);
	const isFullScreen = match("848px");

	return (
		<Flex
			direction={isFullScreen ? "horizontal" : "vertical"}
			backgroundColor='gray-2'
			paddingHorizontal='x4'
			paddingVertical='x3'
			alignChildrenHorizontal='between'
            gap="x2"
		>
			<Flex direction='vertical' gap="x2">
				<Text weight='bold'>{usesRepositoryYml ? "bitrise.yml" : "bitrise.yml editor"}</Text>
				<Text size='x2' textColor='gray-7'>{usesRepositoryYml ? "The content of the bitrise.yml file, fetched from the app's repository." : "You can edit your current config in YAML format:"}</Text>
			</Flex>
			<Flex direction={isFullScreen ? "horizontal" : "vertical"} reverse={!isFullScreen} gap='x2'>
				<WorkflowRecipesLink id='workflow-recipes-yml-editor' />
				{url && <Button level='primary' size='medium' Component='a' href={url} target='_blank'>
					Download currently saved config
				</Button>
				}
			</Flex>
		</Flex>
	);
};

export default YmlEditorHeader;