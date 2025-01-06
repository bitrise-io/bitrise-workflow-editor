enum LicensePoolKind {
  UNITY = 'LICENSE_KIND_UNITY',
}

type License = {
  id: string;
  value: string;
};

type LicensePool = {
  createdAt: string;
  description?: string;
  envVarName: string;
  id: string;
  kind: LicensePoolKind;
  licenses: License[];
  modifiedAt: string;
  name: string;
};

export { License, LicensePool, LicensePoolKind };
