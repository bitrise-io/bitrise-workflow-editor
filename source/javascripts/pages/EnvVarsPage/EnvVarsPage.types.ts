import { EnvVar } from '@/core/models/EnvVar';

export type EnvVarWithUniqueId = EnvVar & {
  uniqueId: string;
};
