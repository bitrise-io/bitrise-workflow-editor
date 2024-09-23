import { Box, Breadcrumb, BreadcrumbLink, Button, Text, useResponsive } from '@bitrise/bitkit';

type Props = {
  appName: string;
  appPath: string;
  workspacePath: string;
  isDiffEditorEnabled: boolean;
  onDiffClick: () => void;
  isDiffDisabled: boolean;
  onSaveClick: () => void;
  isSaveDisabled: boolean;
  isSaveInProgress: boolean;
  onDiscardClick: () => void;
  isDiscardDisabled: boolean;
  isWebsiteMode: boolean;
};

const Header = ({
  appName = '',
  appPath = '/app',
  workspacePath = '/workspace',
  isDiffEditorEnabled,
  onDiffClick,
  isDiffDisabled,
  onSaveClick,
  isSaveDisabled,
  isSaveInProgress,
  onDiscardClick,
  isDiscardDisabled,
  isWebsiteMode,
}: Props) => {
  const { isMobile } = useResponsive();

  return (
    <Box
      as="header"
      display="flex"
      flexDir={['column', 'row']}
      alignItems={['flex-start', 'center']}
      justifyContent="space-between"
      gap="16"
      borderBottom="1px solid"
      borderColor="separator.primary"
      paddingInline={32}
      paddingBlock={16}
    >
      <Breadcrumb hasSeparatorBeforeFirst={isMobile}>
        {isWebsiteMode && workspacePath && !isMobile && (
          <BreadcrumbLink href={workspacePath}>Bitrise CI</BreadcrumbLink>
        )}
        {isWebsiteMode && appPath && appName && <BreadcrumbLink href={appPath}>{appName}</BreadcrumbLink>}
        {(!isWebsiteMode || !isMobile) && (
          <BreadcrumbLink isCurrentPage>
            <Text id="away" textStyle="body/lg/semibold">
              Workflow Editor
            </Text>
          </BreadcrumbLink>
        )}
      </Breadcrumb>

      <Box
        display="flex"
        gap="8"
        justifyContent="stretch"
        flexDir={['column', 'row']}
        alignSelf={['stretch', 'flex-end']}
      >
        {isDiffEditorEnabled && (
          <Button size="sm" className="diff" variant="secondary" onClick={onDiffClick} isDisabled={isDiffDisabled}>
            Show diff
          </Button>
        )}
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
      </Box>
    </Box>
  );
};

export default Header;
