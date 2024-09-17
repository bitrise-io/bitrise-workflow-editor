import { Stack, StackOption } from '@/core/models/Stack';

function getOsOfStack(stack: Stack): string {
  return stack.id.split('-')[0];
}

function getStackById(stacks: Stack[], id: string): Stack | undefined {
  return stacks.find((stack) => stack.id === id);
}

function isSelfHosted(stack: Stack) {
  return stack.id.startsWith('agent');
}

function selectStack(stacks: Stack[], stackId: string, defaultStackId: string): Stack | undefined {
  // - If YML contains a valid stack
  const selectedStack = getStackById(stacks, stackId);
  if (selectedStack) {
    return selectedStack;
  }

  // - If YMl not contains stack info, but default stack is available
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
  selectStack,
  getOsOfStack,
  getStackById,
  isSelfHosted,
  toStackOption,
};
