import { ContainerModel } from '@/core/models/BitriseYml';

export enum ContainerSource {
  Execution = 'execution_containers',
  Service = 'service_containers',
}

export type Container = { id: string; userValues: ContainerModel };
