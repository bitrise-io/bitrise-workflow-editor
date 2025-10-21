import { useQuery } from '@tanstack/react-query';
import { toMerged } from 'es-toolkit';
import { useMemo } from 'react';

import StepApi, { StepApiResult } from '@/core/api/StepApi';
import { StepBundleOverrideModel, StepModel } from '@/core/models/BitriseYml';
import { Step, StepBundleInstance, StepLike, WithGroup } from '@/core/models/Step';
import StepService from '@/core/services/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

type YmlStepResult = {
  data?: StepLike;
};

function useStepFromYml(props: UseStepProps): YmlStepResult {
  const defaultStepLibrary = useDefaultStepLibrary();

  return useBitriseYmlStore(({ yml }) => {
    let stepObjectFromYml: StepModel | WithGroup | StepBundleOverrideModel | null | undefined;

    if (props.parentWorkflowId) {
      const { parentWorkflowId, stepIndex } = props;
      stepObjectFromYml = yml.workflows?.[parentWorkflowId]?.steps?.[stepIndex];
    } else if (props.parentStepBundleId) {
      const { parentStepBundleId, stepIndex } = props;
      stepObjectFromYml = yml.step_bundles?.[parentStepBundleId]?.steps?.[stepIndex];
    }

    if (!stepObjectFromYml) {
      return { data: undefined };
    }

    const [cvs, stepObj] = Object.entries(stepObjectFromYml)[0] ?? ['', {}];
    const step = stepObj ?? {};

    const { id } = StepService.parseStepCVS(cvs, defaultStepLibrary);
    const title = StepService.resolveTitle(cvs, defaultStepLibrary, step);
    const icon = StepService.resolveIcon(cvs, defaultStepLibrary, step);

    if (StepService.isWithGroup(cvs, defaultStepLibrary, step)) {
      return {
        data: { cvs, id, title, icon, defaultValues: step ?? {}, mergedValues: step ?? {}, userValues: step ?? {} },
      };
    }
    if (StepService.isStepBundle(cvs, defaultStepLibrary, step)) {
      return { data: { cvs, id, title, icon, mergedValues: step ?? {}, userValues: step ?? {} } };
    }

    return {
      data: {
        cvs,
        id,
        title: step.title || '', // step.title is optional, but might got a default value from the API
        icon: step.asset_urls?.['icon.svg'] || step.asset_urls?.['icon.png'] || '', // step.asset_urls is optional, but might got a default value from the API
        defaultValues: {},
        userValues: step,
        mergedValues: step,
        resolvedInfo: {},
      },
    };
  });
}

type ApiStepResult = {
  isLoading: boolean;
  data?: StepApiResult;
  error?: Error | null;
};

function useStepFromApi(cvs = ''): ApiStepResult {
  const defaultStepLibrary = useDefaultStepLibrary();
  const { data, error, isLoading } = useQuery({
    queryKey: ['steps', { cvs, defaultStepLibrary }],
    queryFn: () => StepApi.getStepByCvs(cvs, defaultStepLibrary),
    enabled: Boolean(
      cvs && !StepService.isStepBundle(cvs, defaultStepLibrary) && !StepService.isWithGroup(cvs, defaultStepLibrary),
    ),
    staleTime: Infinity,
    retry: false,
  });

  return useMemo(() => {
    if (!cvs) {
      return {
        data: undefined,
        isLoading: false,
        error: new Error('CVS is empty'),
      };
    }

    if (!data) {
      return { data: undefined, isLoading, error };
    }

    return {
      data: {
        cvs,
        id: data.id,
        title: data.title,
        icon: data.icon,
        defaultValues: {
          ...(data?.defaultValues ?? {}),
          inputs: data?.defaultValues?.inputs || [],
        },
        resolvedInfo: data?.resolvedInfo ?? {},
      },
      error,
      isLoading,
    };
  }, [cvs, data, error, isLoading]);
}

type UseStepResult = {
  isLoading: boolean;
  data?: StepLike;
  error?: Error | null;
};

type UseStepProps = {
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
};

const useStep = (props: UseStepProps): UseStepResult => {
  const { data: ymlData } = useStepFromYml(props);
  const defaultStepLibrary = useDefaultStepLibrary();
  const { data: apiData, error, isLoading } = useStepFromApi(ymlData?.cvs ?? '');

  return useMemo(() => {
    const { cvs, id, title, icon, userValues } = ymlData ?? {};
    const { title: defaultTitle, icon: defaultIcon, defaultValues, resolvedInfo } = apiData ?? {};

    if (!cvs || !id) {
      return { data: undefined, isLoading: false };
    }

    if (StepService.isWithGroup(cvs, defaultStepLibrary, userValues)) {
      return {
        data: ymlData as WithGroup,
        isLoading: false,
      };
    }

    if (StepService.isStepBundle(cvs, defaultStepLibrary, userValues)) {
      return {
        data: ymlData as StepBundleInstance,
        isLoading: false,
      };
    }

    const inputs = defaultValues?.inputs?.map(({ opts, ...input }) => {
      const [inputName, defaultValue] = Object.entries(input)[0] ?? ['', ''];
      const inputFromYml = userValues?.inputs?.find(({ opts: _, ...inputObjectFromYml }) => {
        const inputNameFromYml = Object.keys(inputObjectFromYml)[0];
        return inputNameFromYml === inputName;
      });

      return { opts, [inputName]: inputFromYml?.[inputName] ?? defaultValue };
    });

    return {
      isLoading,
      data: {
        cvs,
        id,
        title: title || defaultTitle || '',
        icon: icon || defaultIcon || '',
        defaultValues,
        userValues,
        mergedValues: toMerged(defaultValues || {}, toMerged(userValues || {}, { inputs })),
        resolvedInfo,
      } as Step,
      error,
    };
  }, [ymlData, apiData, error, defaultStepLibrary, isLoading]);
};

export default useStep;
