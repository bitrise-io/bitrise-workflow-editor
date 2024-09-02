type Secret = {
  key: string;
  value?: string;
  isProtected: boolean;
  isExpand: boolean;
  isExpose: boolean;
  source?: string;
  scope?: string;
  isShared?: boolean;
  isKeyChangeable?: boolean;
  isEditing?: boolean;
  isSaved?: boolean;
};

export type { Secret };
