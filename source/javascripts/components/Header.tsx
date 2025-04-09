import { Box, Breadcrumb, BreadcrumbLink, Button, Text, useResponsive } from '@bitrise/bitkit';

import { noop } from 'es-toolkit';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';

// TODO: open diff viewer
const Header = () => {
  const { isMobile } = useResponsive();
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const appName = PageProps.app()?.name ?? '';
  const appPath = isWebsiteMode ? `/app/${PageProps.appSlug()}` : '';

  const hasChanges = useBitriseYmlStore((s) => {
    return JSON.stringify(s.yml) !== JSON.stringify(s.savedYml) || s.ymlString !== s.savedYmlString;
  });

  const onDiscard = () => {
    bitriseYmlStore.setState((s) => ({ yml: s.savedYml, ymlString: s.savedYmlString }));
  };

  const onSave = () => {
    bitriseYmlStore.setState((s) => ({ savedYml: s.yml, savedYmlString: s.ymlString }));
  };

  return (
    <Box
      gap="16"
      as="header"
      display="flex"
      paddingBlock={16}
      paddingInline={32}
      borderBottom="1px solid"
      flexDir={['column', 'row']}
      justifyContent="space-between"
      borderColor="separator.primary"
      alignItems={['flex-start', 'center']}
    >
      <Breadcrumb hasSeparatorBeforeFirst={isMobile}>
        {isWebsiteMode && !isMobile && <BreadcrumbLink href="/dashboard">Bitrise CI</BreadcrumbLink>}
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
        <Button size="sm" className="diff" variant="secondary" onClick={noop} isDisabled={!hasChanges}>
          Show diff
        </Button>
        <Button isDanger size="sm" className="discard" variant="secondary" onClick={onDiscard} isDisabled={!hasChanges}>
          Discard
        </Button>
        <Button size="sm" className="save" variant="primary" onClick={onSave} isDisabled={!hasChanges}>
          Save changes
        </Button>
      </Box>
    </Box>
  );
};

export default Header;
