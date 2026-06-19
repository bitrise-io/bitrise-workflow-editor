import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import { SortableEnvVar } from '@/components/SortableEnvVars/SortableEnvVarItem';
import { EnvVar, EnvVarSource } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { listenToEnvVarCreated } from './SortableEnvVars.events';

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

  const updateKeyDebounced = useDebounceCallback(EnvVarService.updateKey, 250, { leading: false });
  const updateValueDebounced = useDebounceCallback(EnvVarService.updateValue, 250, { leading: false });

  useEffect(() => {
    const base = initialEnvs ?? EnvVarService.getAll(source, sourceId || '');
    setEnvs(
      base.map((env) => ({
        ...env,
        uniqueId: crypto.randomUUID(),
      })),
    );
  }, [source, sourceId, activeFileId, initialEnvs]);

  useEffect(() => {
    if (!listenForExternalChanges) return;

    return listenToEnvVarCreated((event) => {
      if (event.detail.source === source && event.detail.sourceId === sourceId) {
        setEnvs((oldEnvVars) => [...oldEnvVars, { uniqueId: crypto.randomUUID(), ...event.detail.envVar }]);
      }
    });
  }, [listenForExternalChanges, source, sourceId]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current as SortableEnvVar);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id.toString();
    const activeId = event.active.id.toString();

    if (activeId && overId) {
      const currentOverIndex = envs.findIndex(({ uniqueId }) => uniqueId === overId);
      const currentActiveIndex = envs.findIndex(({ uniqueId }) => uniqueId === activeId);
      const reorderedEnvs = arrayMove(envs, currentActiveIndex, currentOverIndex);

      const newIndices: number[] = [];
      reorderedEnvs.forEach((newEnvVar) => {
        const newIndex = envs.findIndex((oldEnvVar) => newEnvVar.uniqueId === oldEnvVar.uniqueId);
        newIndices.push(newIndex);
      });

      setEnvs(reorderedEnvs);
      EnvVarService.reorder(newIndices, { source, sourceId });
    }

    setActiveItem(undefined);
  };

  const onDragCancel = () => {
    setActiveItem(undefined);
  };

  const onAdd = () => {
    setEnvs([...envs, { uniqueId: crypto.randomUUID(), ...EnvVarService.EMPTY_ENV_VAR }]);
    EnvVarService.create({ source, sourceId });
  };

  const onRemove = (index: number) => () => {
    setEnvs(envs.filter((_, i) => i !== index));
    EnvVarService.remove({ source, sourceId, index });
  };

  const onKeyChange = (index: number) => (key: string) => {
    setEnvs(envs.map((env, i) => (i === index ? { ...env, key } : env)));
    updateKeyDebounced(key, { source, sourceId, index, oldKey: envs[index].key });
  };

  const onValueChange = (index: number) => (value: string) => {
    setEnvs(envs.map((env, i) => (i === index ? { ...env, value } : env)));
    updateValueDebounced(value, { source, sourceId, index, key: envs[index].key });
  };

  const onIsExpandChange = (index: number) => (isExpand: boolean) => {
    setEnvs(envs.map((env, i) => (i === index ? { ...env, isExpand } : env)));
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
