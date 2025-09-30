export enum LicensePoolKind {
  UNITY = 'LICENSE_KIND_UNITY',
}

export type License = {
  id: string;
  value: string;
};

export type LicensePool = {
  createdAt: string;
  description?: string;
  envVarName: string;
  id: string;
  kind: LicensePoolKind;
  licenses: License[];
  modifiedAt: string;
  name: string;
};
