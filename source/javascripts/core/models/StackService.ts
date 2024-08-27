import { Stack } from '@/core/models/Stack';

function getOsOfStack(stack: Stack): string {
  return stack.name.split('-')[0];
}

function getStackById(stacks: Stack[], id: string): Stack | undefined {
  return stacks.find((stack) => stack.id === id);
}

function toStackOption(stack: Stack) {
  return {
    name: stack.name,
    value: stack.id,
  };
}

export default {
  getOsOfStack,
  getStackById,
  toStackOption,
};
