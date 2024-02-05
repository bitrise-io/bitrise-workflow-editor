import { Fragment } from "react";

import { 
  Sidebar,
  SidebarItem,
  TypeIconName,
  SidebarDivider,
  SidebarItemIcon,
  SidebarContainer,
  SidebarItemLabel,
  SidebarFooter,
} from "@bitrise/bitkit";

type Item = {
  id: string;
  path: string;
  title: string;
  divided?: true;
}

type Props = {
  items: Item[];
  activeItem?: Item;
  onItemSelected: (item: Item) => void
}

const findItemIcon = (item: Item): TypeIconName | undefined => {
  switch(item.id) {
    case "workflows":
      return "Workflow";
    case "code-signing":
      return "CodeSigning";
    case "secrets":
      return "Lock";
    case "env-vars":
      return "Dollars";
    case "triggers":
      return "Trigger";
    case "stack":
      return "Stack";
    case "licenses":
      return "Key";
    case "yml":
      return "Code";
    default:
      return undefined;
  }
}

const Navigation = ({ items, activeItem, onItemSelected }: Props) => {
  return (
    <Sidebar width={256} height="100%" borderRight="1px solid" borderColor="separator.primary">
      <SidebarContainer>
        {items.map((item) => {
          const icon = findItemIcon(item)
          const isSelected = activeItem?.id === item.id;

          return (
            <Fragment key={item.id}>
              {item.divided && <SidebarDivider />}
              <SidebarItem selected={isSelected} onClick={() => onItemSelected(item)}>
                {icon && <SidebarItemIcon name={icon} />}
                <SidebarItemLabel>
                  {item.title}
                </SidebarItemLabel>
              </SidebarItem>
            </Fragment>
          )
        })}
      </SidebarContainer>
      <SidebarFooter>
        <SidebarDivider />
        <SidebarItem href="https://github.com/bitrise-io/workflow-recipes">
          <SidebarItemIcon name="Doc" />
          <SidebarItemLabel>Workflow Recipes</SidebarItemLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  );
}
 
export default Navigation;