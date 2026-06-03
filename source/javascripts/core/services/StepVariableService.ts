import { EnvironmentItemModel, EnvModel } from '../models/BitriseYml';

function group(inputs?: EnvModel): Record<string, EnvModel> {
  const groups: Record<string, EnvModel> = {};

  if (!inputs) {
    return groups;
  }

  inputs.forEach((input) => {
    const category = input.opts?.category ?? '';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(input);
  });

  return groups;
}

const getName = (input: EnvironmentItemModel) => {
  const { opts: _, ...rest } = input;
  return Object.keys(rest)[0];
};

const getValue = (input: EnvironmentItemModel) => {
  const { opts: _, ...rest } = input;
  return String(Object.values(rest)[0] ?? '');
};

const findInput = (inputs: EnvModel, name: string) => {
  return inputs.find((input) => getName(input) === name);
};

export default {
  group,
  getName,
  getValue,
  findInput,
};
