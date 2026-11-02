import { useCallback } from 'react';

import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import useHashLocation from '@/hooks/useHashLocation';
import useSearchParams from '@/hooks/useSearchParams';
import useVisualEditorNotice from '@/hooks/useVisualEditorNotice';
import { paths } from '@/routes';

import FirstBuildingBlock from './firstBuildingBlock';
import { useLastBlock } from './lastBlock';

// Opens the last CI block if the config still has it, else the config's top block, replacing whatever entity
// the URL picked.
export default function useOpenBuildingBlock() {
  const [, navigate] = useHashLocation();
  const [searchParams] = useSearchParams();
  const visualEditorNotice = useVisualEditorNotice();

  return useCallback(() => {
    const { yml } = bitriseYmlStore.getState();
    const remembered = useLastBlock.getState().target;
    const target =
      remembered && FirstBuildingBlock.exists(yml, remembered)
        ? remembered
        : FirstBuildingBlock.firstBuildingBlock(yml);
    if (!target || visualEditorNotice?.disabled) {
      return;
    }
    const params = new URLSearchParams(searchParams);
    FirstBuildingBlock.entityParams.forEach((param) => params.delete(param));
    params.set(target.param, target.id);
    navigate(`${target.path}?${params.toString()}`);
  }, [navigate, searchParams, visualEditorNotice]);
}

// Closes a tool panel by going back to what it opened over: the YAML page, or the last CI block.
export function useCloseToolPanel() {
  const [, navigate] = useHashLocation();
  const [searchParams] = useSearchParams();
  const openBuildingBlock = useOpenBuildingBlock();

  return useCallback(() => {
    if (!useLastBlock.getState().isYamlView) {
      openBuildingBlock();
      return;
    }
    const query = new URLSearchParams(searchParams).toString();
    navigate(query ? `${paths.yml}?${query}` : paths.yml);
  }, [navigate, openBuildingBlock, searchParams]);
}

export { isToolOverYamlLocation, tabLocationFor, useLastBlock } from './lastBlock';
