type Secret = {
  key: string;
  value?: string;
  isProtected: boolean;
  isExpand: boolean;
  isExpose: boolean;
  source?: string;
  isShared?: boolean;
};

type SecretWithState = Secret & {
  isKeyChangeable: boolean;
  isEditing: boolean;
  isSaved?: boolean;
};

export { Secret, SecretWithState };
