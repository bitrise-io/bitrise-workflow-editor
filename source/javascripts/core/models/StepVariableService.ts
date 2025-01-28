import { StepVariable } from './Step';

const getName = (input: StepVariable) => {
  const { opts, ...rest } = input;
  return Object.keys(rest)[0];
};

const getValue = (input: StepVariable) => {
  const { opts, ...rest } = input;
  return String(Object.values(rest)[0] ?? '');
};

const findInput = (inputs: StepVariable[], name: string) => {
  return inputs.find((input) => getName(input) === name);
};

export default {
  getName,
  getValue,
  findInput,
};
