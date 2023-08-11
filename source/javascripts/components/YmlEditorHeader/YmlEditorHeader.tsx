import { Box, Button, Link, Notification, Text } from "@bitrise/bitkit";

import WorkflowRecipesLink from "../workflow-recipes/WorkflowRecipesLink/WorkflowRecipesLink";

type YmlEditorHeaderProps = {
	url: string;
	usesRepositoryYml?: boolean;
	uniqueStepLimit?: number;
	uniqueStepCount: number;
	organizationSlug?: string;
}
const YmlEditorHeader = ({
	url, usesRepositoryYml, uniqueStepCount, uniqueStepLimit, organizationSlug
	}: YmlEditorHeaderProps): JSX.Element => {
	const showStepLimit = typeof uniqueStepLimit === "number";
	const stepLimitReached = showStepLimit && uniqueStepCount >= uniqueStepLimit;
	const upgradeLink = organizationSlug ?
		`/organization/${organizationSlug}/credit_subscription/plan_selector_page` : undefined;
	return (
		<Box display="flex"
			flexDirection="column"
			backgroundColor='gray-2'
			paddingX="16"
			paddingY="12">
			<Box
				display="flex"
				flexDirection={["column", "row"]}
				justifyContent="space-between"
				gap="8">
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
				<Box display="flex" flexDirection={["column-reverse", "row"]} gap='8' alignItems="center">
					{showStepLimit &&
						<Text color="neutral.40" marginInlineStart="auto" paddingX="16" marginInlineEnd="8">
							{uniqueStepCount}/{uniqueStepLimit} steps used
						</Text>
					}
					<WorkflowRecipesLink linkId='workflow-editor-yml-editor-workflow-recipes-link' trackingName='yml_editor' />
					{url && <Button as='a' href={url} target='_blank'>
						Download currently saved config
					</Button>
					}
				</Box>
			</Box>
			{stepLimitReached && <Notification marginTop="20" status="warning">
				<Text size="3" fontWeight="bold">You cannot add a new Step now.</Text>
				Your team has already reached the limit for this app ({uniqueStepLimit} unique Steps per app) included{" "}
				in your current plan. To add more Steps, <Link isUnderlined href={upgradeLink}>upgrade your plan first</Link>.
			</Notification>}
		</Box>
		);
};

export default YmlEditorHeader;
