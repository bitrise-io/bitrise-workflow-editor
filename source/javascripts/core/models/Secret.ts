type Secret = {
  key: string;
  value?: string;
  scope?: string;
  isProtected: boolean;
  isExpand: boolean;
  isExpose: boolean;
  source?: string;
  isShared?: boolean;
  isKeyChangeable?: boolean;
  isEditing?: boolean;
  isSaved?: boolean;
};

export { Secret };
