import { PipelineYmlObject } from '@/core/models/Pipeline';
import { BitriseYml } from './BitriseYml';

type StagesYml = Required<BitriseYml>['stages'];
type StageYmlObject = StagesYml[string];
type Stage = { id: string; userValues: StageYmlObject };

type PipelinesStages = Required<PipelineYmlObject>['stages'];
type PipelineStageYmlObject = PipelinesStages[number][string];

export { Stage, StagesYml, StageYmlObject, PipelinesStages, PipelineStageYmlObject };
