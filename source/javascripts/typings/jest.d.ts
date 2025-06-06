import { yaml as yamlHelper } from 'spec/yaml-helper';

declare global {
  const yaml: typeof yamlHelper;
}

export {};
