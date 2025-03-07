import { EnvironmentItemModel } from '@/core/models/BitriseYml';

function expandInput(input: EnvironmentItemModel = {}) {
  const { opts, ...keyValuePair } = input;
  const key = Object.keys(keyValuePair)[0] || '';
  const value = (Object.values(keyValuePair)[0] as string | null) || '';
  return {
    key,
    value,
    opts: opts || {},
  };
}

export { expandInput };
