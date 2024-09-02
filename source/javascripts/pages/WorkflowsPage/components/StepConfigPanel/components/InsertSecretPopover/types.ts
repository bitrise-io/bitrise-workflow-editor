import { Secret } from '@/core/Secret';

export type CreateSecretFormValues = Secret;
export type HandlerFn = (secret: Secret) => void;
