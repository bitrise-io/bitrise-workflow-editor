import { Box, Breadcrumb, BreadcrumbLink, Button, ButtonGroup, Text } from "@bitrise/bitkit";

type Props = {
  appName: string;
  appPath: string;
  workspacePath: string;
  workflowsAndPipelinesPath: string;
  onSaveClick: () => void;
  isSaveDisabled: boolean;
  isSaveInProgress: boolean;
  onDiscardClick: () => void;
  isDiscardDisabled: boolean;
}

const Header = ({ 
  appName, 
  appPath, 
  workspacePath, 
  workflowsAndPipelinesPath, 
  onSaveClick, 
  isSaveDisabled,
  isSaveInProgress,
  onDiscardClick,
  isDiscardDisabled,
}: Props) => {
  return (
    <Box as="header" borderBottom="1px solid" borderColor="separator.primary" p={32} pt={24}>
      <Breadcrumb hasSeparatorAfterLast>
        <BreadcrumbLink href={workspacePath}>
          Bitrise CI
        </BreadcrumbLink>
        <BreadcrumbLink href={appPath}>
          {appName}
        </BreadcrumbLink>
        <BreadcrumbLink href={workflowsAndPipelinesPath}>
          Workflows & Pipelines
        </BreadcrumbLink>
      </Breadcrumb>

      <Box display="flex" alignItems="center" justifyContent="space-between" gap={32} mt={24}>
        <Text as="h1" size="6">Workflow Editor</Text>
        <ButtonGroup>
          <Button 
            isDanger
            variant="secondary"
            onClick={onDiscardClick}
            isDisabled={isDiscardDisabled}
          >
            Discard
          </Button>
          <Button
            variant="primary"
            onClick={onSaveClick}
            isDisabled={isSaveDisabled}
            isLoading={isSaveInProgress}
          >
            Save changes
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
}
 
export default Header;