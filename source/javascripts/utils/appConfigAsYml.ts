import { dump } from 'js-yaml';

import { AppConfig } from '../models/AppConfig';

export default function appConfigAsYml(appConfig: AppConfig | undefined): string {
  if (!appConfig) {
    return '';
  }

  if (typeof appConfig === 'string') {
    return appConfig;
  }

  return `---\n${dump(appConfig, { noArrayIndent: true })}`;
}
