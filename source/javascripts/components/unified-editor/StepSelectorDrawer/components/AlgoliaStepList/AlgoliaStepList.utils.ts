export function findScrollContainer(element?: HTMLElement | null) {
  if (!element) {
    return null;
  }

  let parent = element.parentElement;
  while (parent) {
    const { overflow } = window.getComputedStyle(parent);
    if (overflow.split(' ').some((o) => o === 'auto' || o === 'scroll')) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement;
}
