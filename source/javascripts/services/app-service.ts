// TODO: port app service here

export const getAppSlug = (): string|null => {
  const matches = /\/app\/([\w|0-9]+)/.exec(document.location.href);

  if (matches) {
    return matches[1];
  }

  return null;
};
