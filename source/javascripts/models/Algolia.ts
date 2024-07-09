import { Step } from './Step';

type StepInfoModel = {
  maintainer?: string;
  asset_urls?: Step['asset_urls'] & {
    'icon.svg'?: string;
    'icon.png'?: string;
  };
};

export type StepModel = Step;

export type AlgoliaStepResponse = Partial<{
  readonly objectID: string;
  cvs: string;
  id: string;
  version: string;
  is_deprecated: boolean;
  is_latest: boolean;
  latest_version_number: string;
  step: Partial<StepModel>;
  info: StepInfoModel;
}>;
