import { dump } from 'js-yaml';

export type AppConfig = Record<string, unknown> | string;

export function appConfigAsYml(appConfig: AppConfig | undefined): string {
  if (!appConfig) {
    return '';
  }

  if (typeof appConfig === 'string') {
    return appConfig;
  }

  return `---\n${dump(appConfig, { noArrayIndent: true })}`;
}
