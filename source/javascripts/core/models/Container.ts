import { ContainerModel } from '@/core/models/BitriseYml';

export enum ContainerSource {
  Execution = 'execution_container',
  Service = 'service_container',
}

export type Container = { id: string; userValues: ContainerModel };
