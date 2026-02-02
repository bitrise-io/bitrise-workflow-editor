import { ContainerModel, DockerCredentialModel } from '@/core/models/BitriseYml';

export enum ContainerReferenceField {
  Execution = 'execution_container',
  Service = 'service_containers',
}

export enum ContainerType {
  Execution = 'execution',
  Service = 'service',
}

export type Container = { id: string; userValues: ContainerModel };

export type ContainerField = keyof ContainerModel;
export type CredentialField = keyof DockerCredentialModel;
export type ContainerFieldValue<T extends ContainerField> = ContainerModel[T];
export type CredentialFieldValue<T extends CredentialField> = DockerCredentialModel[T];
