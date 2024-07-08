export const parseCvs = (cvs: string) => {
  const cleaned = cvs.replace(/^(git::|path::|git@)/g, '');
  const parts = cleaned.split('@');
  const id = parts[0].split('/').pop();
  const version = parts.length > 1 ? parts.pop() : '';

  return [id, version] as const;
};

export const isStepLib = (cvs: string) => {
  return /^(git::|path::|git@)/g.test(cvs) === false;
};

export const normalizeVersion = (version: string) => {
  if (/^(\d+)(\.\d+)?$/g.test(version)) {
    const match = version.split('.');
    const major = match[0];
    const minor = match[1] || 'x';
    return `${major}.${minor}.x`;
  }
  return version;
};
