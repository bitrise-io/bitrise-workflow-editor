import { Box, Breadcrumb, BreadcrumbLink, Button, Text, useResponsive } from '@bitrise/bitkit';

import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

type Props = {
  appName: string;
  workspacePath: string;
  onDiffClick: () => void;
  isDiffDisabled: boolean;
  onSaveClick: () => void;
  isSaveDisabled: boolean;
  isSaveInProgress: boolean;
  onDiscardClick: () => void;
  isDiscardDisabled: boolean;
};

const Header = ({
  appName = '',
  workspacePath = '/workspace',
  onDiffClick,
  isDiffDisabled,
  onSaveClick,
  isSaveDisabled,
  isSaveInProgress,
  onDiscardClick,
  isDiscardDisabled,
}: Props) => {
  const { isMobile } = useResponsive();
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const appPath = isWebsiteMode ? `/app/${PageProps.appSlug()}` : '';

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
        <Button size="sm" className="diff" variant="secondary" onClick={onDiffClick} isDisabled={isDiffDisabled}>
          Show diff
        </Button>
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
