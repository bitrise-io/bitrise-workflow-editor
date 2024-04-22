import { Box, BoxProps, Icon, Link, Text, Tooltip } from '@bitrise/bitkit';

type WorkflowRecipesLinkProps = {
  linkId: string;
  trackingName?: string;
} & BoxProps;

const WorkflowRecipesLink = ({ linkId, trackingName, ...boxProps }: WorkflowRecipesLinkProps): JSX.Element => {
  return (
    <Box display="flex" alignItems="center" gap="8" paddingY="4" {...boxProps}>
      <Link
        id={linkId}
        href="https://github.com/bitrise-io/workflow-recipes"
        target="_blank"
        colorScheme="purple"
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
