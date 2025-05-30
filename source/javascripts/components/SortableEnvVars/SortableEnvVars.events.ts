import { EnvVar, EnvVarSource } from '@/core/models/EnvVar';

const ENV_VAR_CREATED_EVENT = 'workflow::envs::created' as const;

declare global {
  interface WindowEventMap {
    [ENV_VAR_CREATED_EVENT]: CustomEvent<EnvVarCreatedEventDetail>;
  }
}

type EnvVarCreatedEventDetail = {
  envVar: EnvVar;
  source: EnvVarSource;
  sourceId?: string;
};
type EnvVarCreatedEvent = CustomEvent<EnvVarCreatedEventDetail>;

function dispatchEnvVarCreated(detail: EnvVarCreatedEventDetail) {
  window.dispatchEvent(new CustomEvent(ENV_VAR_CREATED_EVENT, { detail }));
}

function listenToEnvVarCreated(callback: (event: EnvVarCreatedEvent) => void) {
  window.addEventListener(ENV_VAR_CREATED_EVENT, callback);
  return () => window.removeEventListener(ENV_VAR_CREATED_EVENT, callback);
}

export { dispatchEnvVarCreated, listenToEnvVarCreated };
