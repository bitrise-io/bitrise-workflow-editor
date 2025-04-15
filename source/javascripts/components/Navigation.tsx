import { PropsWithChildren, useEffect, useRef } from 'react';
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

import { paths } from '@/routes';
import useHashLocation from '@/hooks/useHashLocation';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import useCiConfiSettings from '@/hooks/useCiConfiSettings';
import useCurrentPage from '@/hooks/useCurrentPage';

type Props = Omit<SidebarProps, 'children'>;
type NavigationItemProps = PropsWithChildren<{
  path: string;
  icon: TypeIconName;
}>;

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
  const { isMobile } = useResponsive();
  const currentPage = useCurrentPage();
  const { data } = useCiConfiSettings();
  const isDefaultTabRef = useRef(true);

  useEffect(() => {
    if (data?.usesRepositoryYml !== undefined) {
      segmentTrack('Workflow Editor Tab Displayed', {
        tab_name: currentPage,
        is_default_tab: isDefaultTabRef.current,
        yml_source: data.usesRepositoryYml ? 'git' : 'bitrise',
      });
      isDefaultTabRef.current = false;
    }
  }, [currentPage, data.usesRepositoryYml]);

  return (
    <Sidebar minW={['88px', '256px']} {...props}>
      <SidebarContainer>
        <NavigationItem path={paths.workflows} icon="Workflow">
          Workflows
        </NavigationItem>
        <NavigationItem path={paths.pipelines} icon="WorkflowFlow">
          Pipelines
        </NavigationItem>
        <NavigationItem path={paths.stepBundles} icon="Steps">
          Step Bundles
        </NavigationItem>
        <NavigationItem path={paths.secrets} icon="Lock">
          Secrets
        </NavigationItem>
        <NavigationItem path={paths.envVars} icon="Dollars">
          Env Vars
        </NavigationItem>
        <NavigationItem path={paths.triggers} icon="Trigger">
          Triggers
        </NavigationItem>
        {RuntimeUtils.isWebsiteMode() && (
          <NavigationItem path={paths.stacksAndMachines} icon="Stack">
            Stacks & Machines
          </NavigationItem>
        )}
        {RuntimeUtils.isWebsiteMode() && (
          <NavigationItem path={paths.licenses} icon="Key">
            Licenses
          </NavigationItem>
        )}
        <SidebarDivider />
        <NavigationItem path={paths.yml} icon="Code">
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
