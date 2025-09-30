export enum SecretScope {
  APP = 'app',
  WORKSPACE = 'workspace',
}

export type Secret = {
  key: string;
  value?: string;
  scope?: string;
  source?: string;
  isExpose: boolean;
  isExpand: boolean;
  isShared?: boolean;
  isProtected?: boolean;
  // UI only fields
  isKeyChangeable?: boolean;
  isEditing?: boolean;
  isSaved?: boolean;
};
