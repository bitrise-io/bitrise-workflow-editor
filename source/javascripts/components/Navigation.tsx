import {
  Sidebar,
  SidebarContainer,
  SidebarDivider,
  SidebarFooter,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemLabel,
  SidebarProps,
  TypeIconName,
  useResponsive,
  useToast,
} from '@bitrise/bitkit';
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useCurrentPage from '@/hooks/useCurrentPage';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useHashLocation from '@/hooks/useHashLocation';
import useSearchParams from '@/hooks/useSearchParams';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
import { paths } from '@/routes';

type Props = Omit<SidebarProps, 'children'>;
type NavigationItemProps = PropsWithChildren<{
  path: string;
  icon: TypeIconName;
}>;

function usePathWithSearchParams() {
  const [searchParams] = useSearchParams();

  return useCallback(
    (path: string) => {
      const searchParamsString = new URLSearchParams(searchParams).toString();
      return searchParamsString ? `${path}?${searchParamsString}` : path;
    },
    [searchParams],
  );
}

const NavigationItem = ({ children, path, icon }: NavigationItemProps) => {
  const toast = useToast();
  const { isMobile } = useResponsive();
  const [hashPath, navigate] = useHashLocation();
  const isSelected = hashPath.startsWith(path);
  const ymlStatus = useYmlValidationStatus();

  const handleNavigation = useCallback(() => {
    if (ymlStatus === 'invalid' && !path.startsWith(paths.yml)) {
      toast({
        status: 'error',
        title: 'Invalid YAML',
        description: 'Please fix the errors in your YAML configuration before navigating.',
        duration: null,
        isClosable: true,
      });
      return;
    }

    navigate(path);
  }, [ymlStatus, navigate, path, toast]);

  return (
    <SidebarItem selected={Boolean(isSelected)} onClick={handleNavigation}>
      <SidebarItemIcon name={icon} />
      {!isMobile && <SidebarItemLabel>{children}</SidebarItemLabel>}
    </SidebarItem>
  );
};

const Navigation = (props: Props) => {
  const currentPage = useCurrentPage();
  const { isMobile } = useResponsive();
  const isDefaultTabRef = useRef(true);
  const { data } = useCiConfigSettings();
  const withSearchParams = usePathWithSearchParams();

  const enableContainersPage = useFeatureFlag('enable-wfe-containers-page');

  useEffect(() => {
    if (data?.usesRepositoryYml) {
      segmentTrack('Workflow Editor Tab Displayed', {
        tab_name: currentPage,
        is_default_tab: isDefaultTabRef.current,
        yml_source: data.usesRepositoryYml ? 'git' : 'bitrise',
      });
      isDefaultTabRef.current = false;
    }
  }, [currentPage, data?.usesRepositoryYml]);

  return (
    <Sidebar minW={['88px', '256px']} {...props}>
      <SidebarContainer>
        <NavigationItem path={withSearchParams(paths.workflows)} icon="Workflow">
          Workflows
        </NavigationItem>
        <NavigationItem path={withSearchParams(paths.pipelines)} icon="WorkflowFlow">
          Pipelines
        </NavigationItem>
        <NavigationItem path={withSearchParams(paths.stepBundles)} icon="Steps">
          Step Bundles
        </NavigationItem>
        <NavigationItem path={withSearchParams(paths.secrets)} icon="Lock">
          Secrets
        </NavigationItem>
        <NavigationItem path={withSearchParams(paths.envVars)} icon="Dollars">
          Env Vars
        </NavigationItem>
        <NavigationItem path={withSearchParams(paths.triggers)} icon="Trigger">
          Triggers
        </NavigationItem>
        {enableContainersPage && (
          <NavigationItem path={withSearchParams(paths.containers)} icon="Container">
            Containers
          </NavigationItem>
        )}
        {RuntimeUtils.isWebsiteMode() && (
          <NavigationItem path={withSearchParams(paths.stacksAndMachines)} icon="Stack">
            Stacks & Machines
          </NavigationItem>
        )}
        {RuntimeUtils.isWebsiteMode() && (
          <NavigationItem path={withSearchParams(paths.licenses)} icon="Key">
            Licenses
          </NavigationItem>
        )}
        <SidebarDivider />
        <NavigationItem path={withSearchParams(paths.yml)} icon="Code">
          Configuration YAML
        </NavigationItem>
      </SidebarContainer>
      <SidebarFooter>
        <SidebarItem href="https://github.com/bitrise-io/workflow-recipes">
          <SidebarItemIcon name="Doc" />
          {!isMobile && <SidebarItemLabel>Workflow Recipes</SidebarItemLabel>}
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default Navigation;
