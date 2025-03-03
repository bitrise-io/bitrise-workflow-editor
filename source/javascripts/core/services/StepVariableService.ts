import { EnvironmentItemModel, EnvModel } from '../models/BitriseYml';

const getName = (input: EnvironmentItemModel) => {
  const { opts, ...rest } = input;
  return Object.keys(rest)[0];
};

const getValue = (input: EnvironmentItemModel) => {
  const { opts, ...rest } = input;
  return String(Object.values(rest)[0] ?? '');
};

const findInput = (inputs: EnvModel, name: string) => {
  return inputs.find((input) => getName(input) === name);
};

export default {
  getName,
  getValue,
  findInput,
};
