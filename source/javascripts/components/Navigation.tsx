import { ComponentPropsWithoutRef, Fragment, useEffect, useRef } from 'react';
import {
  Sidebar,
  SidebarContainer,
  SidebarDivider,
  SidebarFooter,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemLabel,
  TypeIconName,
  useResponsive,
} from '@bitrise/bitkit';
import { segmentTrack } from '@/utils/segmentTracking';

type Item = {
  id: string;
  path: string;
  title: string;
  divided?: true;
  cssClass: string;
};

type Props = {
  items: Item[];
  activeItem?: Item;
  onItemSelected: (item: Item) => void;
};

const findItemIcon = (item: Item): TypeIconName | undefined => {
  switch (item.id) {
    case 'workflows':
      return 'Workflow';
    case 'pipelines':
      return 'WorkflowFlow';
    case 'secrets':
      return 'Lock';
    case 'env-vars':
      return 'Dollars';
    case 'triggers':
      return 'Trigger';
    case 'stack':
      return 'Stack';
    case 'licenses':
      return 'Key';
    case 'yml':
      return 'Code';
    default:
      return undefined;
  }
};

// NOTE: This is necessary because we can't set the data-e2e-tag prop of the SidebarItem.
const NavigationItem = ({ e2e, ...props }: ComponentPropsWithoutRef<typeof SidebarItem> & { e2e: string }) => {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('data-e2e-tag', `${e2e}-tab`);
    }
  }, [e2e]);

  return <SidebarItem {...props} ref={ref} />;
};

// NOTE: This is necessary because we can't set the id and target props of the SidebarItem.
const WorkflowRecepiesItem = (props: ComponentPropsWithoutRef<typeof SidebarItem>) => {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('id', 'workflow-editor-main-toolbar-workflow-recipes-link');
      ref.current.setAttribute('target', '_blank');
    }
  }, []);

  return <SidebarItem {...props} ref={ref} />;
};

const Navigation = ({ items, activeItem, onItemSelected }: Props) => {
  const { isMobile } = useResponsive();

  return (
    <Sidebar
      id="menu-nav"
      height="100%"
      width={[72, 256]}
      paddingTop={[0, 24]}
      borderRight="1px solid"
      borderColor="separator.primary"
    >
      <SidebarContainer>
        {items.map((item) => {
          const icon = findItemIcon(item);
          const isSelected = activeItem?.id === item.id;

          return (
            <Fragment key={item.id}>
              {item.divided && <SidebarDivider />}
              <NavigationItem e2e={item.cssClass} selected={isSelected} onClick={() => onItemSelected(item)}>
                {icon && <SidebarItemIcon left={[-8, 0]} position="relative" name={icon} />}
                {!isMobile && <SidebarItemLabel>{item.title}</SidebarItemLabel>}
              </NavigationItem>
            </Fragment>
          );
        })}
      </SidebarContainer>
      <SidebarFooter>
        <SidebarDivider />
        <WorkflowRecepiesItem
          href="https://github.com/bitrise-io/workflow-recipes"
          onClick={() =>
            segmentTrack('Workflow Editor Workflow Recipes Button Clicked', {
              source: 'menu_bar_workflow_recipes_button',
            })
          }
        >
          <SidebarItemIcon left={[-8, 0]} position="relative" name="Doc" />
          {!isMobile && <SidebarItemLabel>Workflow Recipes</SidebarItemLabel>}
        </WorkflowRecepiesItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default Navigation;
