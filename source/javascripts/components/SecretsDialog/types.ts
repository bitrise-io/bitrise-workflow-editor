export type Secret = {
  key: string;
  value: string;
  source: string;
  isExpand: boolean;
  isExpose: boolean;
};

export type HandlerFn = (secret: Secret) => void;
export type SelectSecretFormValues = { key: string; filter: string };
export type CreateSecretFormValues = Secret;
