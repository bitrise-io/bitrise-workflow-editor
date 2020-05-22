// TODO: port app service here

type Variable = {
	isKeyChangeable: boolean;
	shouldShowValue: boolean;
	isProtected: (value?: boolean) => boolean;
	value: <T>(value?: T) => T;
}

export const getAppSlug = (): string|null => {
  const matches = /\/app\/([\w|0-9]+)/.exec(document.location.href);

  if (matches) {
    return matches[1];
  }

  return null;
};

export const handleSecretAfterSave = (secret: Variable): void => {
	secret.isKeyChangeable = false;
	secret.shouldShowValue = false;
	if (secret.isProtected()) {
		secret.value(null);
	}
};
