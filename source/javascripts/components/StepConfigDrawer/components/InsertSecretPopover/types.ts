import { Secret } from '@/core/models/Secret';

export type CreateSecretFormValues = Secret;
export type HandlerFn = (secret: Secret) => void;
