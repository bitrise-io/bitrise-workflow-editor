function generateUniqueEntityId(existingIds: string[], prefix: string, i = 0) {
  const potentialId = i === 0 ? prefix : `${prefix}_${i}`;
  if (existingIds?.includes(potentialId)) {
    return generateUniqueEntityId(existingIds, prefix, i + 1);
  }
  return potentialId;
}

function findScrollContainer(element?: HTMLElement | null) {
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

function download(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export { generateUniqueEntityId, findScrollContainer, download };
