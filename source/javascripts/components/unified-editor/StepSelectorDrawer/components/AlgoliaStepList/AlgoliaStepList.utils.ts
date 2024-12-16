import { AlgoliaStepResponse } from '@/core/api/StepApi';
import {} from 'es-toolkit';

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

export function createVirtualizedItems(steps: AlgoliaStepResponse[]) {
  const result: (string | AlgoliaStepResponse)[] = [];
  const categoryMap = new Map<string, AlgoliaStepResponse[]>();

  steps.forEach((step) => {
    step.step.type_tags?.forEach((category) => {
      categoryMap.set(category, [...(categoryMap.get(category) ?? []), step]);
    });
  });

  categoryMap.forEach((stps, category) => {
    result.push(category, ...stps);
  });

  return result;
}
