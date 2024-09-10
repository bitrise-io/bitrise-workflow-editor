import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useQuery } from '@tanstack/react-query';
import merge from 'lodash/merge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Step, StepYmlObject } from '@/core/models/Step';
import StepService from '@/core/models/StepService';
import StepApi from '@/core/api/StepApi';

type YmlStepResult = {
  data?: Required<Pick<Step, 'cvs' | 'userValues'>>;
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

      // TODO handle step bundle and with group
      if (StepService.isStepBundle(cvs, step) || StepService.isWithGroup(cvs, step)) {
        return { data: { cvs, userValues: step as StepYmlObject } };
      }

      return {
        data: {
          cvs,
          userValues: step as StepYmlObject,
        },
      };
    }),
  );
}

type ApiStepResult = {
  data?: Required<Pick<Step, 'cvs' | 'defaultValues' | 'resolvedInfo'>>;
  isLoading: boolean;
};

function useStepFromApi(cvs = ''): ApiStepResult {
  const { data, isLoading: isLoadingStep } = useQuery({
    queryKey: ['steps', { cvs }],
    queryFn: () => StepApi.getStepByCvs(cvs),
    enabled: Boolean(cvs),
  });

  return useMemo(() => {
    return {
      data: {
        cvs,
        defaultValues: {
          ...(data?.defaultValues ?? {}),
          inputs: data?.defaultValues?.inputs || [],
        },
        resolvedInfo: data?.resolvedInfo ?? {},
      },
      isLoading: isLoadingStep,
    };
  }, [cvs, data, isLoadingStep]);
}

type UseStepResult = {
  data?: Step;
  isLoading?: boolean;
};

const useStep = (workflowId: string, stepIndex: number): UseStepResult => {
  const { data: ymlData } = useStepFromYml(workflowId, stepIndex);
  const cvs = ymlData?.cvs ?? '';

  const { data: apiData, isLoading: isLoadingApi } = useStepFromApi(cvs);

  return useMemo(() => {
    const userValues = ymlData?.userValues ?? {};
    const defaultValues = apiData?.defaultValues ?? {};
    const resolvedInfo = apiData?.resolvedInfo ?? {};

    if (!cvs) {
      return { data: undefined, isLoading: false };
    }

    if (StepService.isStepBundle(cvs) || StepService.isWithGroup(cvs)) {
      return {
        data: {
          cvs,
          defaultValues: {},
          userValues,
          mergedValues: {},
          resolvedInfo: {},
        },
        isLoading: isLoadingApi,
      };
    }

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
        defaultValues,
        userValues,
        mergedValues: merge({}, defaultValues, userValues, { inputs }),
        resolvedInfo: {
          ...resolvedInfo,
          title: userValues?.title || resolvedInfo?.title || cvs,
        },
      },
      isLoading: isLoadingApi,
    };
  }, [cvs, ymlData, apiData, isLoadingApi]);
};

export default useStep;
