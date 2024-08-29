import { PipelineYmlObject } from '@/core/models/Pipeline';
import { BitriseYml } from './BitriseYml';

type Stages = Required<BitriseYml>['stages'];
type StageYmlObject = Stages[string];
type Stage = { id: string; userValues: StageYmlObject };

type PipelinesStages = Required<PipelineYmlObject>['stages'];
type PipelineStageYmlObject = PipelinesStages[number][string];

export { Stage, Stages, StageYmlObject, PipelinesStages, PipelineStageYmlObject };
