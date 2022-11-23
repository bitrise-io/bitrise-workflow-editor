import { Box, Button, Text } from "@bitrise/bitkit";

import WorkflowRecipesLink from "../workflow-recipes/WorkflowRecipesLink/WorkflowRecipesLink";

type YmlEditorHeaderProps = {
	url: string;
	usesRepositoryYml?: boolean;
}
const YmlEditorHeader = ({ url, usesRepositoryYml}: YmlEditorHeaderProps): JSX.Element => {
	return (
		<Box
			display="flex"
			flexDirection={["column", "row"]}
			backgroundColor='gray-2'
			paddingX="16"
			paddingY="12"
			justifyContent="space-between"
			gap="8"
		>
			<Box>
				<Text fontWeight='bold' marginBottom="8">{usesRepositoryYml ? "bitrise.yml" : "bitrise.yml editor"}</Text>
				<Text size='2' color="neutral.40">
					{
						usesRepositoryYml ?
						"The content of the bitrise.yml file, fetched from the app's repository." :
						"You can edit your current config in YAML format:"
					}
				</Text>
			</Box>
			<Box display="flex" flexDirection={["column-reverse", "row"]} gap='8'>
				<WorkflowRecipesLink linkId='workflow-editor-yml-editor-workflow-recipes-link' trackingName='yml_editor' />
				{url && <Button as='a' href={url} target='_blank'>
					Download currently saved config
				</Button>
				}
			</Box>
		</Box>
	);
};

export default YmlEditorHeader;
