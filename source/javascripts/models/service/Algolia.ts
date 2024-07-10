import { Step } from '../domain/Step';

export type AlgoliaStepResponse = Partial<{
  readonly objectID: string;
  cvs: string;
  id: string;
  version: string;
  is_deprecated: boolean;
  is_latest: boolean;
  latest_version_number: string;
  step: Partial<Step>;
  info: {
    maintainer?: string;
    asset_urls?: Step['asset_urls'] & {
      'icon.svg'?: string;
      'icon.png'?: string;
    };
  };
}>;
