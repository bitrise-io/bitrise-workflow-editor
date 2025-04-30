import { yaml as yamlHelper } from 'spec/yaml-helper';

import { BitriseYml } from '@/core/models/BitriseYml';

declare global {
  const yaml: typeof yamlHelper;
  namespace jest {
    interface Matchers<R> {
      toMatchBitriseYml(expected: BitriseYml): R;
    }
  }
}

export {};
