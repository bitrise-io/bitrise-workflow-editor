import { Box, Icon, Link, Text, Tooltip, BoxProps } from "@bitrise/bitkit";

import Hotjar from "../../../utils/hotjar";

type WorkflowRecipesLinkProps = {
  linkId: string;
  trackingName?: string;
} & BoxProps;

const WorkflowRecipesLink = ({
  linkId,
  trackingName,
  ...boxProps
}: WorkflowRecipesLinkProps): JSX.Element => {
  const trackAction = (): void => {
    const eventName = `wfe_workflow_recipes_action_${trackingName}`;
    Hotjar.event(eventName);
  };

  return (
    <Box display="flex" alignItems="center" gap="8" paddingY="4" {...boxProps}>
      <Link
        id={linkId}
        href="https://github.com/bitrise-io/workflow-recipes"
        target="_blank"
        colorScheme="purple"
        onClick={trackAction}
        display="flex"
        alignItems="center"
        gap="4"
      >
        <Icon name="OpenInBrowser" width="20px" height="20px" />
        <Text as="span">Workflow Recipes</Text>
      </Link>
      <Tooltip
        label={
          <>
            Workflow Recipes provide ready-made
            <br /> solutions for common Workflow tasks.
          </>
        }
      >
        <Icon name="Support" width="20px" height="20px" color="neutral.70" />
      </Tooltip>
    </Box>
  );
};

export default WorkflowRecipesLink;
