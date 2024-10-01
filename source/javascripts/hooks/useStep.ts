import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useQuery } from '@tanstack/react-query';
import merge from 'lodash/merge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Step, StepBundle, StepLike, WithGroup } from '@/core/models/Step';
import StepService from '@/core/models/StepService';
import StepApi, { StepApiResult } from '@/core/api/StepApi';

type YmlStepResult = {
  data?: StepLike;
};

function useStepFromYml(workflowId: string, stepIndex: number): YmlStepResult {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const stepObjectFromYml = yml.workflows?.[workflowId]?.steps?.[stepIndex];

      if (!stepObjectFromYml) {
        return { data: undefined };
      }

      const [cvs, step] = Object.entries(stepObjectFromYml)[0];

      if (!step) {
        return { data: undefined };
      }

      const { id } = StepService.parseStepCVS(cvs);
      const title = StepService.resolveTitle(cvs, step);
      const icon = StepService.resolveIcon(cvs, step);

      if (StepService.isWithGroup(cvs, step)) {
        return { data: { cvs, id, title, icon, userValues: step } };
      }
      if (StepService.isStepBundle(cvs, step)) {
        return { data: { cvs, id, title, icon, userValues: step } };
      }
      if (StepService.isStep(cvs, step)) {
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
      }

      return { data: undefined };
    }),
  );
}

type ApiStepResult = {
  data?: StepApiResult;
  isLoading: boolean;
};

function useStepFromApi(cvs = ''): ApiStepResult {
  const { data, isLoading } = useQuery({
    queryKey: ['steps', { cvs }],
    queryFn: () => StepApi.getStepByCvs(cvs),
    enabled: Boolean(cvs && !StepService.isStepBundle(cvs) && !StepService.isWithGroup(cvs)),
    staleTime: Infinity,
  });

  return useMemo(() => {
    if (!cvs) {
      return { data: undefined, isLoading: false };
    }

    if (!data) {
      return { data: undefined, isLoading };
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
      isLoading,
    };
  }, [cvs, data, isLoading]);
}

type UseStepResult = {
  data?: Step | WithGroup | StepBundle;
  isLoading?: boolean;
};

const useStep = (workflowId: string, stepIndex: number): UseStepResult => {
  const { data: ymlData } = useStepFromYml(workflowId, stepIndex);
  const { data: apiData, isLoading } = useStepFromApi(ymlData?.cvs ?? '');

  return useMemo(() => {
    const { cvs, id, title, icon, userValues } = ymlData ?? {};
    const { title: defaultTitle, icon: defaultIcon, defaultValues, resolvedInfo } = apiData ?? {};

    if (!cvs || !id) {
      return { data: undefined, isLoading: false };
    }

    if (StepService.isWithGroup(cvs, userValues)) {
      return {
        data: ymlData as WithGroup,
        isLoading: false,
      };
    }

    if (StepService.isStepBundle(cvs, userValues)) {
      return {
        data: ymlData as StepBundle,
        isLoading: false,
      };
    }

    if (StepService.isStep(cvs, userValues)) {
      const inputs = defaultValues?.inputs?.map(({ opts, ...input }) => {
        const [inputName, defaultValue] = Object.entries(input)[0];
        const inputFromYml = userValues?.inputs?.find(({ opts: _, ...inputObjectFromYml }) => {
          const inputNameFromYml = Object.keys(inputObjectFromYml)[0];
          return inputNameFromYml === inputName;
        });

        return { opts, [inputName]: inputFromYml?.[inputName] ?? defaultValue };
      });

      return {
        data: {
          cvs,
          id,
          title: title || defaultTitle || '',
          icon: icon || defaultIcon || '',
          defaultValues,
          userValues,
          mergedValues: merge({}, defaultValues, userValues, { inputs }),
          resolvedInfo,
        } as Step,
        isLoading,
      };
    }

    return { data: undefined, isLoading: false };
  }, [ymlData, apiData, isLoading]);
};

export default useStep;
