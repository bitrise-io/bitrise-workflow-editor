import { Box, Button, Link, Text, useDisclosure } from "@bitrise/bitkit";
import RecipeDialog from "../RecipeDialog";


type YmlEditorHeaderProps = {
	url: string;
	usesRepositoryYml?: boolean;
	appSlug: string;
	onYmlChange: (yml: string) => void;
	appConfigYml: string;
}
const YmlEditorHeader = ({ url, usesRepositoryYml, appSlug, onYmlChange, appConfigYml }: YmlEditorHeaderProps): JSX.Element => {
	const {isOpen, onOpen, onClose} = useDisclosure({defaultIsOpen:true});
	const onCloseDialog = (result?: string): void => {
		onClose();
		if(result) {
			onYmlChange(result);
		}
	};
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
				<Link as="button" onClick={onOpen}>Config generator</Link>
				{url && <Button as='a' href={url} target='_blank'>
					Download currently saved config
				</Button>
				}
			</Box>
			<RecipeDialog appConfigYml={appConfigYml} slug={appSlug} isOpen={isOpen} onClose={onCloseDialog} />
		</Box>
	);
};

export default YmlEditorHeader;
