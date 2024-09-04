import { Stack, StackOption } from '@/core/models/Stack';

function getOsOfStack(stack: Stack): string {
  return stack.name.split('-')[0];
}

function getStackById(stacks: Stack[], id: string): Stack | undefined {
  if (!id) {
    return;
  }

  return (
    stacks.find((stack) => stack.id === id) ?? {
      id,
      name: id,
      machineTypes: [],
    }
  );
}

function selectStack(stacks: Stack[], stackId: string, defaultStackId: string): Stack | undefined {
  const selectedStack = getStackById(stacks, stackId);
  if (selectedStack) {
    return selectedStack;
  }
  const defaultStack = getStackById(stacks, defaultStackId);
  if (defaultStack) {
    return { ...defaultStack, id: '' };
  }

  return undefined;
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
  selectStack,
  toStackOption,
};
