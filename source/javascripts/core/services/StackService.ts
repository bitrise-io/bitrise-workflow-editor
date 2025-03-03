import { Stack, StackOption } from '../models/Stack';

function getOsOfStack(stack: Stack): string {
  return stack.id.split('-')[0];
}

function getStackById(stacks: Stack[], id: string): Stack | undefined {
  return stacks.find((stack) => stack.id === id);
}

function isSelfHosted(stack: Stack) {
  return stack.id.startsWith('agent');
}

function toStackOption(stack: Stack): StackOption {
  return {
    value: stack.id,
    label: stack.name,
  };
}

export default {
  getOsOfStack,
  getStackById,
  isSelfHosted,
  toStackOption,
};
