export type Secret = {
  key: string;
  value: string;
  isProtected: boolean;
  isExpand: boolean;
  isExpose: boolean;
  isKeyChangeable: boolean;
  isSaved?: boolean;
  isEditing?: boolean;
  isShared?: boolean;
};

export type SecretWithState = Secret & {
  isEditing: boolean;
  isSaved?: boolean;
};
