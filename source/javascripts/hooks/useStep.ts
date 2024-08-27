import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import merge from 'lodash/merge';
import { useQuery } from '@tanstack/react-query';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useAlgoliaStepInputs } from '@/hooks/useAlgolia';
import { Step, StepYmlObject } from '@/core/models/Step';
import VersionUtils from '@/core/utils/VersionUtils';
import StepService from '@/core/models/StepService';
import StepApi from '@/core/api/StepApi';
import defaultIcon from '@/../images/step/icon-default.svg';

type UseStepResult = {
  data?: Step;
  isLoading?: boolean;
};

function useStepFromYml(workflowId: string, stepIndex: number): UseStepResult {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const stepObjectFromYml = yml.workflows?.[workflowId]?.steps?.[stepIndex];

      if (!stepObjectFromYml) {
        return { data: undefined };
      }

      const [cvs, step] = Object.entries(stepObjectFromYml)[0];
      const [id, version = ''] = StepService.parseStepCVS(cvs);

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
          defaultValues: undefined, // The defaults are coming from the step.yml file loaded from the API
          userValues: step as StepYmlObject,
          mergedValues: undefined, // Will contain the merged values of the defaults and user values
          resolvedInfo: {
            cvs,
            id,
            title: StepService.resolveTitle(cvs, step),
            icon: StepService.resolveIcon(step),
            version,
            normalizedVersion: VersionUtils.normalizeVersion(version) || version,
          },
        },
      };
    }),
  );
}

function useStepFromApi(cvs = ''): UseStepResult {
  console.log('useStepFromApi', cvs);
  const { data, isLoading: isLoadingStep } = useQuery({
    queryKey: ['steps', { cvs }],
    queryFn: () => StepApi.getStepByCvs(cvs),
    enabled: Boolean(cvs),
  });

  const { defaultValues, resolvedInfo } = data ?? {};
  const resolvedCvs = resolvedInfo?.cvs || cvs;
  const { data: inputs, isLoading: isLoadingInputs } = useAlgoliaStepInputs({
    cvs: resolvedCvs,
    enabled: Boolean(resolvedCvs && StepService.isStepLibStep(cvs)),
  });

  return useMemo(() => {
    return {
      data: { cvs, defaultValues: { ...defaultValues, inputs }, resolvedInfo },
      isLoading: isLoadingStep || isLoadingInputs,
    };
  }, [cvs, defaultValues, inputs, resolvedInfo, isLoadingStep, isLoadingInputs]);
}

const useStep = (workflowId: string, stepIndex: number): UseStepResult | undefined => {
  const { data: ymlData, isLoading: isLoadingYml } = useStepFromYml(workflowId, stepIndex);
  const { cvs, userValues, resolvedInfo: ymlResolvedInfo } = ymlData ?? {};
  const { data: apiData, isLoading: isLoadingApi } = useStepFromApi(cvs);
  const { defaultValues, resolvedInfo: apiResolvedInfo } = apiData ?? {};

  console.log(ymlData, apiData);

  return useMemo(() => {
    if (!cvs) {
      return { data: undefined };
    }

    if (StepService.isStepBundle(cvs) || StepService.isWithGroup(cvs)) {
      return {
        data: {
          cvs,
          resolvedInfo: {
            cvs,
            id: cvs,
            title: StepService.resolveTitle(cvs),
            icon: defaultIcon,
            version: '',
            normalizedVersion: '',
          },
        },
        isLoading: isLoadingYml || isLoadingApi,
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
        mergedValues: {
          ...merge({}, defaultValues, userValues),
          inputs,
        },
        resolvedInfo: {
          ...ymlResolvedInfo,
          ...apiResolvedInfo,
        } as Step['resolvedInfo'],
      },
      isLoading: isLoadingYml || isLoadingApi,
    };
  }, [apiResolvedInfo, cvs, defaultValues, isLoadingApi, isLoadingYml, userValues, ymlResolvedInfo]);
};

export default useStep;
