import { AlgoliaStepResponse } from '@/core/api/StepApi';

export function findScrollContainer(element?: HTMLElement | null) {
  if (!element) {
    return null;
  }

  let parent = element.parentElement;
  while (parent) {
    const { overflow } = window.getComputedStyle(parent);
    if (overflow.split(' ').every((o) => o === 'auto' || o === 'scroll')) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement;
}

export function createVirtualizedItems(steps: AlgoliaStepResponse[], columns: number) {
  const result: Array<string | AlgoliaStepResponse[]> = [];
  const categoryMap = new Map<string, AlgoliaStepResponse[]>();

  steps.forEach((step) => {
    step.step.type_tags?.forEach((category) => {
      categoryMap.set(category, [...(categoryMap.get(category) ?? []), step]);
    });
  });

  categoryMap.forEach((stepsInCategory, category) => {
    result.push(category);
    while (stepsInCategory.length) {
      result.push([...stepsInCategory.splice(0, columns)]);
    }
  });

  return result;
}
