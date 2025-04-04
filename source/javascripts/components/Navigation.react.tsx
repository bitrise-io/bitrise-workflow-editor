import { PropsWithChildren, useMemo } from 'react';
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
import { Link, useRoute, useSearch } from 'wouter';

import { paths } from '@/routes';

type Props = Omit<SidebarProps, 'children'>;
type NavigationItemProps = PropsWithChildren<{ path: string; icon: TypeIconName }>;

const NavigationItem = ({ children, path, icon }: NavigationItemProps) => {
  const search = useSearch();
  const { isMobile } = useResponsive();
  const [isSelected] = useRoute(new RegExp(`${path}$`));

  const pathWithSearchParams = useMemo(() => {
    if (!search) return path;
    return `${path}?${search}`;
  }, [path, search]);

  return (
    <Link to={pathWithSearchParams} asChild>
      <SidebarItem selected={Boolean(isSelected)}>
        <SidebarItemIcon name={icon} />
        {!isMobile && <SidebarItemLabel>{children}</SidebarItemLabel>}
      </SidebarItem>
    </Link>
  );
};

const Navigation = (props: Props) => {
  const { isMobile } = useResponsive();

  return (
    <Sidebar minW={['88px', '256px']} {...props}>
      <SidebarContainer>
        <NavigationItem path={paths.pipelines} icon="WorkflowFlow">
          Pipelines
        </NavigationItem>
        <NavigationItem path={paths.workflows} icon="Workflow">
          Workflows
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
        <NavigationItem path={paths.stacksAndMachines} icon="Stack">
          Stacks & Machines
        </NavigationItem>
        <NavigationItem path={paths.licenses} icon="Key">
          Licenses
        </NavigationItem>
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
