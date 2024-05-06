import { EnvironmentVariable } from './types';

export function filterEnvVars(envVars: EnvironmentVariable[], filter: string): EnvironmentVariable[] {
  if (!filter) {
    return envVars;
  }

  return envVars.filter(
    ({ key, source }) =>
      key.toUpperCase().includes(filter.toUpperCase()) || source.toUpperCase().includes(filter.toUpperCase()),
  );
}
