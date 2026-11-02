import {
  BitkitIconComponent,
  IconContainer,
  IconDollar,
  IconKey,
  IconLock,
  IconStack,
  IconTrigger,
} from '@bitrise/bitkit-v2';

import { paths } from '@/routes';

// The tools, each opening its page in a panel over the canvas. `page` is the path's last segment, as
// `useCurrentPage` names it.
const TOOLS: Array<{
  page: string;
  path: string;
  icon: BitkitIconComponent;
  label: string;
  intercomTarget: string;
  isWebsiteOnly?: boolean;
}> = [
  {
    page: 'env_vars',
    path: paths.envVars,
    icon: IconDollar,
    label: 'Env Vars',
    intercomTarget: 'Env Vars Page Navigation Item',
  },
  {
    page: 'secrets',
    path: paths.secrets,
    icon: IconLock,
    label: 'Secrets',
    intercomTarget: 'Secrets Page Navigation Item',
  },
  {
    page: 'triggers',
    path: paths.triggers,
    icon: IconTrigger,
    label: 'Triggers',
    intercomTarget: 'Triggers Page Navigation Item',
  },
  {
    page: 'stacks',
    path: paths.stacksAndMachines,
    icon: IconStack,
    label: 'Stacks & Machines',
    intercomTarget: 'Stacks & Machines Page Navigation Item',
    isWebsiteOnly: true,
  },
  {
    page: 'containers',
    path: paths.containers,
    icon: IconContainer,
    label: 'Containers',
    intercomTarget: 'Containers Page Navigation Item',
  },
  {
    page: 'licenses',
    path: paths.licenses,
    icon: IconKey,
    label: 'Licenses',
    intercomTarget: 'Licenses Page Navigation Item',
    isWebsiteOnly: true,
  },
];

export default TOOLS;
