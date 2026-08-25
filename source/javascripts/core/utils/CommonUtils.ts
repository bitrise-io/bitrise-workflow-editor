function generateUniqueEntityId(existingIds: string[], prefix: string, i = 0) {
  const potentialId = i === 0 ? prefix : `${prefix}_${i}`;
  if (existingIds?.includes(potentialId)) {
    return generateUniqueEntityId(existingIds, prefix, i + 1);
  }
  return potentialId;
}

// A parallel workflow is materialised at build time as `<id>_<n>` copies that only ever exist in
// the build, never in the config — so an id arriving from a build can carry one of those suffixes.
const PARALLEL_WORKFLOW_VARIANT_REGEX = /_\d+$/;

/**
 * The source workflow id behind a generated parallel-workflow id (`sharded-tests_13` →
 * `sharded-tests`), or `undefined` when the id carries no such suffix. The inverse of the
 * `<prefix>_<n>` convention {@link generateUniqueEntityId} produces.
 */
function parallelWorkflowSourceId(id: string): string | undefined {
  const sourceId = id.replace(PARALLEL_WORKFLOW_VARIANT_REGEX, '');
  return sourceId === id ? undefined : sourceId;
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

function getFormattedDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function getCookie(cname: string): string {
  const name = `${cname}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return '';
}

export { download, findScrollContainer, generateUniqueEntityId, getCookie, getFormattedDate, parallelWorkflowSourceId };
