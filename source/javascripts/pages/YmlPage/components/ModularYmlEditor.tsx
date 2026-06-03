import Editor from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';

import LoadingState from '@/components/LoadingState';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import {
  bitriseYmlStore,
  getModularConfigTree,
  MERGED_CONFIG_NODE_ID,
  setMergedConfig,
} from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import YmlUtils from '@/core/utils/YmlUtils';
import { useFile } from '@/hooks/useFile';
import { useSelectedNodeId } from '@/hooks/useTree';

/**
 * Read-only source view of the active tab — the selected file, or the merged
 * config (fetched on demand). Per-file editing and the bitrise language server
 * are scoped to a later task; this makes file navigation visible today.
 */
const ModularYmlEditor = () => {
  const selectedNodeId = useSelectedNodeId();
  const isMerged = selectedNodeId === MERGED_CONFIG_NODE_ID;

  const file = useFile(isMerged ? '' : (selectedNodeId ?? ''));
  const mergedYml = useStore(bitriseYmlStore, (s) => s.mergedYml);
  const isMergedStale = useStore(bitriseYmlStore, (s) => s.mergedYmlStale);

  // Ref guard (not React state) so the fetch doesn't re-enter and we avoid a
  // synchronous setState inside the effect.
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!isMerged || !isMergedStale || isFetchingRef.current) {
      return undefined;
    }

    const tree = getModularConfigTree();
    if (!tree) {
      return undefined;
    }

    let cancelled = false;
    isFetchingRef.current = true;
    BitriseYmlApi.getMergedConfig({ projectSlug: PageProps.appSlug(), tree })
      .then((result) => {
        if (!cancelled) {
          setMergedConfig(result.mergedYml);
        }
      })
      .finally(() => {
        isFetchingRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [isMerged, isMergedStale]);

  // While the merged view is selected but still stale with nothing to show yet.
  if (isMerged && isMergedStale && !mergedYml) {
    return <LoadingState />;
  }

  const value = isMerged ? (mergedYml ?? '') : file ? YmlUtils.toYml(file.ymlDocument) : '';
  const path = isMerged ? 'file:///merged_config.yml' : `file:///modular/${file?.path ?? 'unknown.yml'}`;

  return (
    <Editor
      theme="vs-dark"
      language="yaml"
      path={path}
      value={value}
      options={{ readOnly: true, minimap: { enabled: false } }}
    />
  );
};

export default ModularYmlEditor;
