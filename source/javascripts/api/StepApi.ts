import algoliasearch from 'algoliasearch';
import uniqBy from 'lodash/uniqBy';
import { Maintainer, Step, StepObject } from '@/core/Step';
import { withId } from '@/core/WithId';
import defaultIcon from '../../images/step/icon-default.svg';

const ALGOLIA_APP_ID = 'HI1538U2K4';
const ALGOLIA_API_KEY = '708f890e859e7c44f309a1bbad3d2de8';
const ALGOLIA_STEPLIB_STEPS_INDEX = 'steplib_steps';
const ALGOLIA_STEPLIB_INPUTS_INDEX = 'steplib_inputs';

// DTOs
type AlgoliaStepResponse = Partial<{
  readonly objectID: string;
  id: string;
  cvs: string;
  version: string;
  is_deprecated: boolean;
  is_latest: boolean;
  latest_version_number: string;
  step: Partial<StepObject>;
  info: {
    maintainer?: Maintainer;
    asset_urls?: StepObject['asset_urls'] & {
      'icon.svg'?: string;
      'icon.png'?: string;
    };
  };
}>;

// type AlgoliaStepInputDTO = Partial<{
//   readonly objectID: string;
//   id: string;
//   cvs: string;
//   version: string;
//   is_latest: boolean;
// }>;

// TRANSFORMATIONS
function toStep(dto: AlgoliaStepResponse): Step | undefined {
  if (!dto.id || !dto.cvs) {
    return undefined;
  }

  return withId([
    dto.id,
    {
      id: dto.id,
      cvs: dto.cvs,
      icon:
        dto.step?.asset_urls?.['icon.svg'] ||
        dto.step?.asset_urls?.['icon.png'] ||
        dto.info?.asset_urls?.['icon.svg'] ||
        dto.info?.asset_urls?.['icon.png'] ||
        defaultIcon,
      title: dto.step?.title || '',
      summary: dto.step?.summary || '',
      description: dto.step?.description || '',
      version: dto.version || '',
      categories: dto.step?.type_tags || [],
      isOfficial: dto.info?.maintainer === Maintainer.Bitrise || false,
      isVerified: dto.info?.maintainer === Maintainer.Verified || false,
      isCommunity: dto.info?.maintainer === Maintainer.Community || false,
      isDeprecated: dto.is_deprecated || false,
    },
  ]);
}

// function toStepInput(dto: AlgoliaStepInputDTO): StepInput | undefined {
//   if (!dto.id || !dto.cvs) {
//     return undefined;
//   }
//
//   return {
//     id: dto.id,
//     cvs: dto.cvs,
//   };
// }

// API CALLS
function getAlgoliaClients() {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
  return {
    stepsClient: client.initIndex(ALGOLIA_STEPLIB_STEPS_INDEX),
    inputsClient: client.initIndex(ALGOLIA_STEPLIB_INPUTS_INDEX),
  };
}

async function getAllSteps() {
  const { stepsClient } = getAlgoliaClients();
  const results: Array<AlgoliaStepResponse> = [];
  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (objects) => results.push(...objects),
    filters: 'is_latest:true AND is_deprecated:false',
  });
  return uniqBy(results, 'id').map(toStep).filter(Boolean) as Step[];
}

async function getStepById({ id, latestOnly }: { id: string; latestOnly?: boolean }) {
  const { stepsClient } = getAlgoliaClients();
  const results: AlgoliaStepResponse[] = [];
  await stepsClient.browseObjects<AlgoliaStepResponse>({
    batch: (batch) => results.push(...batch),
    filters: latestOnly ? `id:${id} AND is_latest:true` : `id:${id}`,
  });
  return results.map(toStep).filter(Boolean)[0];
}

// async function getStepInputsById({ id }: { id: string }) {
//   const { inputsClient } = getAlgoliaClients();
//   const results: AlgoliaStepInputDTO[] = [];
//   await inputsClient.browseObjects<AlgoliaStepDTO>({
//     batch: (batch) => results.push(...batch),
//     filters: `id:${id} AND is_latest:true`,
//   });
//   return results.map(toStepInput).filter(Boolean) as StepInput[];
// }

export default {
  getAllSteps,
  getStepById,
};
