import { create } from 'zustand';

import { paths } from '@/routes';

import FirstBuildingBlock, { BlockTarget } from './firstBuildingBlock';

// The tool pages, which open in a panel instead of replacing the page. Kept here without the rail's icons
// (tools.ts), so light modules can tell a tool location apart; keep the two lists in step.
export const TOOL_PATHS = [
  paths.envVars,
  paths.secrets,
  paths.triggers,
  paths.stacksAndMachines,
  paths.containers,
  paths.licenses,
];

// The last CI block opened (read from the URL whenever a CI blocks page names an entity), so coming back to
// CI blocks continues where you were. The layout also shows it behind an open tool panel. `isYamlView` says
// the YAML page was open last instead: then a tool panel opens over the YAML, and closing it returns there.
export const useLastBlock = create<{ target?: BlockTarget; isYamlView?: boolean }>(() => ({}));

// A raw hash location (e.g. `#!/secrets?branch=main`): its prefix, path and query.
const LOCATION_PATTERN = /^(#?!?)([^?]*)(?:\?(.*))?$/;
export const isToolPath = (path: string) => TOOL_PATHS.some((toolPath) => path.startsWith(toolPath));

/** True when a raw hash location is a tool panel open over the YAML page. */
export function isToolOverYamlLocation(location: string) {
  const [, , path = ''] = LOCATION_PATTERN.exec(location) ?? [];
  return isToolPath(path) && Boolean(useLastBlock.getState().isYamlView);
}

/**
 * What a file tab should remember as its page when it's left. A tool panel isn't a page of its own: the tab
 * remembers the CI block under it instead, so coming back to the tab shows CI blocks, not the tool. Undefined
 * when there's no CI block to remember.
 */
export function tabLocationFor(location: string): string | undefined {
  const [, prefix = '', path = '', query = ''] = LOCATION_PATTERN.exec(location) ?? [];
  if (!isToolPath(path)) {
    return location;
  }
  const target = useLastBlock.getState().target;
  if (!target) {
    return undefined;
  }
  const params = new URLSearchParams(query);
  FirstBuildingBlock.entityParams.forEach((param) => params.delete(param));
  params.set(target.param, target.id);
  return `${prefix}${target.path}?${params.toString()}`;
}
