import { useCallback, useEffect } from 'react';
import { Box, Breadcrumb, BreadcrumbLink, Button, Text, useDisclosure, useResponsive, useToast } from '@bitrise/bitkit';

import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import { useSaveCiConfigJson, useSaveCiConfigYml } from '@/hooks/useCiConfig';
import useIsYmlPage from '@/hooks/useIsYmlPage';
import useHashLocation from '@/hooks/useHashLocation';
import DiffEditorDialog from './DiffEditor/DiffEditorDialog';

const onSuccess = () => {
  bitriseYmlStore.setState((s) => ({
    savedYml: s.yml,
    savedYmlString: s.ymlString,
  }));
};

const onDiscard = () => {
  bitriseYmlStore.setState((s) => ({
    yml: s.savedYml,
    ymlString: s.savedYmlString,
  }));
};

const Header = () => {
  const toast = useToast();
  const isYmlPage = useIsYmlPage();
  const { isMobile } = useResponsive();
  const [pathWithSearchParams] = useHashLocation();
  const { isOpen, onClose, onOpen: openDiffViewer } = useDisclosure();

  const hasChanges = useBitriseYmlStore((s) => {
    return JSON.stringify(s.yml) !== JSON.stringify(s.savedYml) || s.ymlString !== s.savedYmlString;
  });

  const { isPending: ciConfigYmlIsSaving, mutate: saveCiConfigYml } = useSaveCiConfigYml({
    onSuccess,
    onError: (error) => {
      toast({
        title: 'Failed to save changes',
        description: error.getResponseErrorMessage() || error.message || 'Something went wrong',
        status: 'error',
        duration: null,
        isClosable: true,
      });
    },
  });

  const { isPending: ciConfigJsonIsSaving, mutate: saveCiConfigJson } = useSaveCiConfigJson({
    onSuccess,
    onError: (error) => {
      toast({
        title: 'Failed to save changes',
        description: error.getResponseErrorMessage() || error.message || 'Something went wrong',
        status: 'error',
        duration: null,
        isClosable: true,
      });
    },
  });

  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const appSlug = PageProps.appSlug();
  const appName = PageProps.app()?.name ?? '';
  const appPath = isWebsiteMode ? `/app/${appSlug}` : '';
  const isSaving = ciConfigYmlIsSaving || ciConfigJsonIsSaving;
  const tabOpenDuringSave = pathWithSearchParams.split('?')[0].split('/').pop();

  const saveCIConfig = useCallback(() => {
    if (isYmlPage) {
      saveCiConfigYml({
        projectSlug: appSlug,
        data: bitriseYmlStore.getState().ymlString,
        tabOpenDuringSave,
      });
    } else {
      saveCiConfigJson({
        projectSlug: appSlug,
        data: bitriseYmlStore.getState().yml,
        tabOpenDuringSave,
      });
    }
  }, [appSlug, isYmlPage, saveCiConfigJson, saveCiConfigYml, tabOpenDuringSave]);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && hasChanges && !isSaving) {
        e.preventDefault();
        saveCIConfig();
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, [hasChanges, isSaving, saveCIConfig]);

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
        gap="8"
        display="flex"
        justifyContent="stretch"
        flexDir={['column', 'row']}
        alignSelf={['stretch', 'flex-end']}
      >
        <Button
          size="sm"
          className="diff"
          variant="secondary"
          onClick={openDiffViewer}
          isDisabled={!hasChanges || isSaving}
        >
          Show diff
        </Button>
        <Button
          isDanger
          size="sm"
          className="discard"
          variant="secondary"
          onClick={onDiscard}
          isDisabled={!hasChanges || isSaving}
        >
          Discard
        </Button>
        <Button
          size="sm"
          className="save"
          variant="primary"
          onClick={saveCIConfig}
          isLoading={isSaving}
          isDisabled={!hasChanges}
        >
          Save changes
        </Button>
      </Box>
      <DiffEditorDialog isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Header;
