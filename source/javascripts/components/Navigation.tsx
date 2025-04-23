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
} from '@bitrise/bitkit';
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useCurrentPage from '@/hooks/useCurrentPage';
import useHashLocation from '@/hooks/useHashLocation';
import useSearchParams from '@/hooks/useSearchParams';
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
  const { isMobile } = useResponsive();
  const [hashPath, navigate] = useHashLocation();
  const isSelected = hashPath.startsWith(path);

  return (
    <SidebarItem selected={Boolean(isSelected)} onClick={() => navigate(path)}>
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
        <SidebarDivider />
        <SidebarItem href="https://github.com/bitrise-io/workflow-recipes">
          <SidebarItemIcon name="Doc" />
          {!isMobile && <SidebarItemLabel>Workflow Recipes</SidebarItemLabel>}
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default Navigation;
