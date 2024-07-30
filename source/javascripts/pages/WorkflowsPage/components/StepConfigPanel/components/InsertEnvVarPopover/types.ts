import { EnvVar } from '@/models/EnvVar';

export type CreateEnvVarFormValues = EnvVar;
export type HandlerFn = (envVar: EnvVar) => void;
