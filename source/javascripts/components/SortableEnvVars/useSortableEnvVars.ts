import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounceCallback, useUnmount } from 'usehooks-ts';

import { SortableEnvVar } from '@/components/SortableEnvVars/SortableEnvVarItem';
import { EnvVar, EnvVarSource } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { listenToEnvVarCreated } from './SortableEnvVars.events';

/**
 * The file a write lands in. `updateBitriseYmlDocument` reads exactly this when the mutator runs, so
 * it is read from the store — not from a rendered value or a ref an effect maintains — at both ends
 * of a debounced write: a file switch reaches the store before React re-renders, and the debounce
 * timer can fire in between.
 */
function activeWriteTarget() {
  return bitriseYmlStore.getState().selectedNodeId;
}

type UseSortableEnvVarsProps = {
  source: EnvVarSource;
  sourceId?: string;
  listenForExternalChanges?: boolean;
  /** Pre-resolved env vars to display instead of reading from the store — used by the merged read-only
   * per-file grouping (where the list comes from a specific file, not the active document). */
  initialEnvs?: EnvVar[];
};

export const useSortableEnvVars = ({
  source,
  sourceId,
  listenForExternalChanges = false,
  initialEnvs,
}: UseSortableEnvVarsProps) => {
  const [activeItem, setActiveItem] = useState<SortableEnvVar>();
  const [envs, setEnvs] = useState<SortableEnvVar[]>([]);
  // In modular YAML mode the same `sourceId` can exist in multiple files, so the active
  // file is part of the identity of the env var list — re-seed when it changes.
  const activeFileId = useBitriseYmlStore((s) => s.selectedNodeId);

  // The document addresses env vars by position, so every mutation has to resolve the row's index
  // at the moment it runs. `envs` catches up only on re-render, so two handler calls landing in the
  // same React batch (a double click on Remove, a click on a row while a drag settles) would both
  // resolve against the pre-update list and send the same — by then out-of-bounds — index to the
  // document. This ref carries the up-to-date list between renders.
  const envsRef = useRef<SortableEnvVar[]>([]);

  const updateEnvs = useCallback((updater: (current: SortableEnvVar[]) => SortableEnvVar[]) => {
    envsRef.current = updater(envsRef.current);
    setEnvs(envsRef.current);
  }, []);

  /** Current position of a row, or -1 once it is gone from the list. */
  const indexOf = useCallback((uniqueId: string) => {
    return envsRef.current.findIndex((env) => env.uniqueId === uniqueId);
  }, []);

  const isMountedRef = useRef(true);

  useUnmount(() => {
    isMountedRef.current = false;
  });

  /**
   * Where a pending write is still allowed to land: the row's current position, or -1 when it may
   * not be applied at all.
   *
   * A debounce timer outlives the interaction that scheduled it, and the write resolves both its
   * row and its target document only when it runs:
   *
   * - The row moves when a preceding row is removed or the list is reordered, so a position
   *   captured before the delay would write to whatever ended up there.
   * - `updateBitriseYmlDocument` picks the file from the active tab as the mutator runs. In modular
   *   mode the same `sourceId` can live in several files, so a file switch inside the window would
   *   redirect the write into a document it was never meant for — silently, when that file happens
   *   to hold a matching key. See `activeWriteTarget` for why the store is read directly here.
   * - After unmount there is nothing left to write for. (`useDebounceCallback`'s own unmount cancel
   *   targets a different debounce instance than the one it hands back, so the timer still fires.)
   */
  const resolvePendingRow = useCallback(
    (at: { uniqueId: string; fileId?: string }) => {
      if (!isMountedRef.current || at.fileId !== activeWriteTarget()) {
        return -1;
      }

      return indexOf(at.uniqueId);
    },
    [indexOf],
  );

  // `oldKey`/`key` stay captured at call time: they describe the row itself — what the caller knows
  // the document holds for it — not where it sits, so they survive the row moving.
  const flushKeyUpdate = useCallback(
    (newKey: string, at: { uniqueId: string; fileId?: string; oldKey: string }) => {
      const index = resolvePendingRow(at);

      if (index === -1) {
        return;
      }

      EnvVarService.updateKey(newKey, { source, sourceId, index, oldKey: at.oldKey });
    },
    [resolvePendingRow, source, sourceId],
  );

  const flushValueUpdate = useCallback(
    (value: string, at: { uniqueId: string; fileId?: string; key: string }) => {
      const index = resolvePendingRow(at);

      if (index === -1) {
        return;
      }

      EnvVarService.updateValue(value, { source, sourceId, index, key: at.key });
    },
    [resolvePendingRow, source, sourceId],
  );

  const updateKeyDebounced = useDebounceCallback(flushKeyUpdate, 250, { leading: false });
  const updateValueDebounced = useDebounceCallback(flushValueUpdate, 250, { leading: false });

  // `initialEnvs` is fixed to a specific file, so the active-file change must not re-seed it;
  // only re-seed on active-file changes when the list is read from the store.
  const reseedFileId = initialEnvs ? undefined : activeFileId;

  useEffect(() => {
    const base = initialEnvs ?? EnvVarService.getAll(source, sourceId || '');
    updateEnvs(() =>
      base.map((env) => ({
        ...env,
        uniqueId: crypto.randomUUID(),
      })),
    );
  }, [source, sourceId, reseedFileId, initialEnvs, updateEnvs]);

  useEffect(() => {
    if (!listenForExternalChanges) return;

    return listenToEnvVarCreated((event) => {
      if (event.detail.source === source && event.detail.sourceId === sourceId) {
        updateEnvs((oldEnvVars) => [...oldEnvVars, { uniqueId: crypto.randomUUID(), ...event.detail.envVar }]);
      }
    });
  }, [listenForExternalChanges, source, sourceId, updateEnvs]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current as SortableEnvVar);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id.toString();
    const activeId = event.active.id.toString();
    const currentEnvs = envsRef.current;
    const currentOverIndex = overId ? indexOf(overId) : -1;
    const currentActiveIndex = activeId ? indexOf(activeId) : -1;

    // Either row may already be gone (the list re-seeded, or the row was removed mid-drag).
    // `arrayMove` treats a -1 as an offset from the end, which would reorder unrelated rows.
    if (currentOverIndex !== -1 && currentActiveIndex !== -1) {
      const reorderedEnvs = arrayMove(currentEnvs, currentActiveIndex, currentOverIndex);
      const newIndices = reorderedEnvs.map((newEnvVar) =>
        currentEnvs.findIndex((oldEnvVar) => newEnvVar.uniqueId === oldEnvVar.uniqueId),
      );

      updateEnvs(() => reorderedEnvs);
      EnvVarService.reorder(newIndices, { source, sourceId });
    }

    setActiveItem(undefined);
  };

  const onDragCancel = () => {
    setActiveItem(undefined);
  };

  const onAdd = () => {
    updateEnvs((current) => [...current, { uniqueId: crypto.randomUUID(), ...EnvVarService.EMPTY_ENV_VAR }]);
    EnvVarService.create({ source, sourceId });
  };

  const onRemove = (uniqueId: string) => () => {
    const index = indexOf(uniqueId);

    if (index === -1) {
      return;
    }

    updateEnvs((current) => current.filter((_, i) => i !== index));
    EnvVarService.remove({ source, sourceId, index });
  };

  const onKeyChange = (uniqueId: string) => (key: string) => {
    const index = indexOf(uniqueId);

    if (index === -1) {
      return;
    }

    const oldKey = envsRef.current[index].key;
    updateEnvs((current) => current.map((env, i) => (i === index ? { ...env, key } : env)));
    updateKeyDebounced(key, { uniqueId, fileId: activeWriteTarget(), oldKey });
  };

  const onValueChange = (uniqueId: string) => (value: string) => {
    const index = indexOf(uniqueId);

    if (index === -1) {
      return;
    }

    const { key } = envsRef.current[index];
    updateEnvs((current) => current.map((env, i) => (i === index ? { ...env, value } : env)));
    updateValueDebounced(value, { uniqueId, fileId: activeWriteTarget(), key });
  };

  const onIsExpandChange = (uniqueId: string) => (isExpand: boolean) => {
    const index = indexOf(uniqueId);

    if (index === -1) {
      return;
    }

    updateEnvs((current) => current.map((env, i) => (i === index ? { ...env, isExpand } : env)));
    EnvVarService.updateIsExpand(isExpand, { source, sourceId, index });
  };

  const countValidationErrors = () => {
    return envs.reduce((acc, env) => {
      const keyError = EnvVarService.validateKey(env.key);
      return acc + (keyError !== true ? 1 : 0);
    }, 0);
  };

  return {
    envs,
    activeItem,
    onDragStart,
    onDragEnd,
    onDragCancel,
    onAdd,
    onRemove,
    onKeyChange,
    onValueChange,
    onIsExpandChange,
    countValidationErrors,
  };
};
