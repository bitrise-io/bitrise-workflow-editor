import { Box, Breadcrumb, BreadcrumbLink, Button, ButtonGroup, Text } from '@bitrise/bitkit';

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
};

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
  const isBreadcrumbVisible = appName && appPath && workspacePath && workflowsAndPipelinesPath;

  return (
    <Box
      as="header"
      display="flex"
      flexDir="row"
      alignItems="center"
      justifyContent={isBreadcrumbVisible ? 'space-between' : 'flex-end'}
      borderBottom="1px solid"
      borderColor="separator.primary"
      paddingInline={32}
      paddingBlock={24}
    >
      {isBreadcrumbVisible && (
        <Breadcrumb>
          <BreadcrumbLink href={workspacePath}>Bitrise CI</BreadcrumbLink>
          <BreadcrumbLink href={appPath}>{appName}</BreadcrumbLink>
          <BreadcrumbLink href={workflowsAndPipelinesPath}>Workflows & Pipelines</BreadcrumbLink>
          <BreadcrumbLink isCurrentPage>
            <Text textStyle="body/lg/semibold">Workflow Editor</Text>
          </BreadcrumbLink>
        </Breadcrumb>
      )}

      <ButtonGroup spacing="16" align-self="flex-end">
        <Button
          isDanger
          size="sm"
          className="discard"
          variant="secondary"
          onClick={onDiscardClick}
          isDisabled={isDiscardDisabled}
        >
          Discard
        </Button>
        <Button
          size="sm"
          className="save"
          variant="primary"
          onClick={onSaveClick}
          isDisabled={isSaveDisabled}
          isLoading={isSaveInProgress}
        >
          Save changes
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default Header;
