import { Box, Card } from '@bitrise/bitkit';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';

import { EnvModel } from '@/core/models/BitriseYml';
import EnvVarService from '@/core/services/EnvVarService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { EnvVarWithUniqueId } from '../../EnvVarsPage.types';
import EnvVarsTableFooter from './EnvVarsTableFooter';
import EnvVarsTableHeader from './EnvVarsTableHeader';
import EnvVarsTableItem from './EnvVarsTableItem';

type Props = {
  source: 'project' | 'workflow';
  sourceId?: string;
};

function generateEmptyEnv(): EnvVarWithUniqueId {
  return {
    uniqueId: crypto.randomUUID(),
    key: '',
    value: '',
    source: '',
    isExpand: false,
  };
}

const EMPTY_ENVS: EnvModel = [];

const EnvVarsTable = ({ source, sourceId }: Props) => {
  const [activeItem, setActiveItem] = useState<EnvVarWithUniqueId>();
  const updateProjectEnvVars = useBitriseYmlStore((state) => state.updateProjectEnvVars);
  const updateWorkflowEnvVars = useBitriseYmlStore((state) => state.updateWorkflowEnvVars);

  const ymlEnvVars = useBitriseYmlStore((state) => {
    if (source === 'project') {
      return state.yml.app?.envs ?? EMPTY_ENVS;
    }

    if (source === 'workflow' && sourceId) {
      return state.yml.workflows?.[sourceId]?.envs ?? EMPTY_ENVS;
    }

    return EMPTY_ENVS;
  });

  const [envs, setEnvs] = useState<EnvVarWithUniqueId[]>(
    ymlEnvVars.map((env) => ({
      uniqueId: crypto.randomUUID(),
      ...EnvVarService.fromYml(env, sourceId),
    })),
  );

  const updateEnvs = (newEnvVars: EnvVarWithUniqueId[]) => {
    setEnvs(newEnvVars);

    if (source === 'project') {
      updateProjectEnvVars(newEnvVars);
    }

    if (source === 'workflow' && sourceId) {
      updateWorkflowEnvVars(sourceId, newEnvVars);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current as EnvVarWithUniqueId);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const overId = event.over?.id.toString();
    const activeId = event.active.id.toString();

    if (activeId && overId) {
      const currentOverIndex = envs.findIndex(({ uniqueId }) => uniqueId === overId);
      const currentActiveIndex = envs.findIndex(({ uniqueId }) => uniqueId === activeId);
      updateEnvs(arrayMove(envs, currentActiveIndex, currentOverIndex));
    }

    setActiveItem(undefined);
  };

  const onDragCancel = () => {
    setActiveItem(undefined);
  };

  const onAddNewEnvVar = () => {
    updateEnvs([...envs, generateEmptyEnv()]);
  };

  const onRemoveEnvVar = (uniqueId: string) => {
    updateEnvs(envs.filter((env) => env.uniqueId !== uniqueId));
  };

  const onChangeEnvVar = (env: EnvVarWithUniqueId) => {
    updateEnvs(envs.map((oldEnv) => (oldEnv.uniqueId === env.uniqueId ? env : oldEnv)));
  };

  return (
    <Card as="section" variant="outline">
      <EnvVarsTableHeader />
      <Box>
        <DndContext
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onDragCancel={onDragCancel}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={envs.map(({ uniqueId }) => uniqueId)} strategy={verticalListSortingStrategy}>
            {envs.map((env) => (
              <EnvVarsTableItem env={env} key={env.uniqueId} onChange={onChangeEnvVar} onRemove={onRemoveEnvVar} />
            ))}
          </SortableContext>
          <DragOverlay>{activeItem && <EnvVarsTableItem env={activeItem} isDragging />}</DragOverlay>
        </DndContext>
      </Box>
      <EnvVarsTableFooter onClickAddNewButton={onAddNewEnvVar} />
    </Card>
  );
};

export default EnvVarsTable;
