// TODO: port app service here

type Variable = {
	isKeyChangeable: boolean;
	shouldShowValue: boolean;
	isProtected: (value?: boolean) => boolean;
	value: <T>(value?: T) => T;
};

export const getAppSlug = (): string | null => {
	const matches = new RegExp(
		// eslint-disable-next-line max-len
		".*/app/((?:[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})|(?:[a-zA-Z0-9]{16}))(?:[/?#].*)?",
	).exec(document.location.href);

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
