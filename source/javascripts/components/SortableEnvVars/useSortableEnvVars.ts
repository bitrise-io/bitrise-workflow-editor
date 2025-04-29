import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';

import { SortableEnvVar } from '@/components/SortableEnvVars/SortableEnvVarItem';
import { EnvVarSource } from '@/core/models/EnvVar';
import EnvVarService from '@/core/services/EnvVarService';

import { listenToEnvVarCreated } from './SortableEnvVars.events';

type UseSortableEnvVarsProps = {
  source: EnvVarSource;
  sourceId?: string;
  listenForExternalChanges?: boolean;
};

export const useSortableEnvVars = ({ source, sourceId, listenForExternalChanges = false }: UseSortableEnvVarsProps) => {
  const [activeItem, setActiveItem] = useState<SortableEnvVar>();
  const [envs, setEnvs] = useState<SortableEnvVar[]>([]);

  useEffect(() => {
    setEnvs(
      EnvVarService.getEnvVars(source, sourceId || '').map((env) => ({
        ...env,
        uniqueId: crypto.randomUUID(),
      })),
    );
  }, [source, sourceId]);

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
      EnvVarService.reorder(newIndices, source, sourceId);
    }

    setActiveItem(undefined);
  };

  const onDragCancel = () => {
    setActiveItem(undefined);
  };

  const onAdd = () => {
    setEnvs([...envs, { uniqueId: crypto.randomUUID(), ...EnvVarService.EMPTY_ENV_VAR }]);
    EnvVarService.create(source, sourceId);
  };

  const onRemove = (index: number) => () => {
    setEnvs(envs.filter((_, i) => i !== index));
    EnvVarService.remove(index, source, sourceId);
  };

  const onKeyChange = (index: number) => (key: string) => {
    setEnvs(envs.map((env, i) => (i === index ? { ...env, key } : env)));
    EnvVarService.updateKey(envs[index].key, key, index, source, sourceId);
  };

  const onValueChange = (index: number) => (value: string) => {
    setEnvs(envs.map((env, i) => (i === index ? { ...env, value } : env)));
    EnvVarService.updateValue(envs[index].key, value, index, source, sourceId);
  };

  const onIsExpandChange = (index: number) => (isExpand: boolean) => {
    setEnvs(envs.map((env, i) => (i === index ? { ...env, isExpand } : env)));
    EnvVarService.updateIsExpand(isExpand, index, source, sourceId);
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
