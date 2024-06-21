import { AlgoliaStepResponse } from '../../models/Algolia';
import defaultIcon from '../../../images/step/icon-default.svg';

export type SearchFormValues = {
  search: string;
  projectType: string;
  categories: string[];
};

export type Step = {
  id: string;
  icon: string;
  title: string;
  summary: string;
  description: string;
  version: string;
  categories: string[];
  isOfficial: boolean;
  isVerified: boolean;
  isDeprecated: boolean;
};

export const fromAlgolia = (response?: AlgoliaStepResponse): Step | undefined => {
  if (!response) {
    return undefined;
  }

  return {
    id: response.id || '',
    icon:
      response.step?.asset_urls?.['icon.svg'] ||
      response.step?.asset_urls?.['icon.png'] ||
      response.info?.asset_urls?.['icon.svg'] ||
      response.info?.asset_urls?.['icon.png'] ||
      defaultIcon,
    title: response.step?.title || '',
    summary: response.step?.summary || '',
    description: response.step?.description || '',
    version: response.version || '',
    categories: response.step?.type_tags || [],
    isOfficial: response.info?.maintainer === 'bitrise' || false,
    isVerified: response.info?.maintainer === 'community' || false,
    isDeprecated: response.is_deprecated || false,
  };
};
