import { Secret } from '@/models/Secret';

export type CreateSecretFormValues = Secret;
export type HandlerFn = (secret: Secret) => void;
