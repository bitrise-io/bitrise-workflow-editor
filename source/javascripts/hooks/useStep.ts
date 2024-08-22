import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useQuery } from '@tanstack/react-query';
import merge from 'lodash/merge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Step } from '@/core/models/Step';
import { useAlgoliaStep, useAlgoliaStepInputs } from '@/hooks/useAlgolia';
import CvsUtils from '@/core/utils/CvsUtils';

type UseStepResult = {
  cvs: string;
  step?: Step;
  isLoading: boolean;
};

const useStepFromYml = (workflowId: string, stepIndex: number): UseStepResult => {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const stepObjectFromYml = yml.workflows?.[workflowId]?.steps?.[stepIndex];

      if (!stepObjectFromYml) {
        return { cvs: '', isLoading: true };
      }

      const [cvs, step] = Object.entries(stepObjectFromYml)[0];

      if (CvsUtils.isStepLibStep(cvs, step) || CvsUtils.isGitStep(cvs, step) || CvsUtils.isLocalStep(cvs, step)) {
        return { cvs, step, isLoading: true };
      }

      return { cvs, isLoading: true };
    }),
  );
};

const useStepFromAlgolia = (cvs = ''): UseStepResult => {
  const [id] = CvsUtils.parseStepCVS(cvs);
  const { data: step, isLoading: isLoadingInfo } = useAlgoliaStep({
    cvs,
    enabled: Boolean(id && CvsUtils.isStepLibStep(cvs)),
  });

  const { data: inputs, isLoading: isLoadingInputs } = useAlgoliaStepInputs({
    cvs: step?.info?.cvs || cvs,
    enabled: Boolean(step?.info?.cvs),
  });

  return useMemo(() => {
    return {
      cvs: step?.info?.cvs || cvs,
      step: { ...step, inputs },
      isLoading: isLoadingInfo || isLoadingInputs,
    };
  }, [cvs, inputs, isLoadingInfo, isLoadingInputs, step]);
};

const useStepFromLocalApi = (cvs = ''): UseStepResult => {
  const [id, version] = CvsUtils.parseStepCVS(cvs);

  let library: string = '';
  if (CvsUtils.isLocalStep(cvs)) {
    library = 'path';
  } else if (CvsUtils.isGitStep(cvs)) {
    library = 'git';
  }

  const { data, isLoading } = useQuery({
    enabled: Boolean(id && library),
    queryKey: ['/api/step-info', id, library, version],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/step-info', {
        signal,
        method: 'POST',
        body: JSON.stringify({ id, library, version }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      return (await response.json()) as {
        step?: Step;
        info?: { asset_urls?: { [x: string]: string } };
      };
    },
  });

  return useMemo(() => {
    return {
      cvs,
      isLoading,
      step: data?.step,
    };
  }, [cvs, isLoading, data]);
};

const useStep = (workflowId: string, stepIndex: number): UseStepResult | undefined => {
  const { cvs, step: stepFromYml } = useStepFromYml(workflowId, stepIndex);

  const stepFromAlgolia = useStepFromAlgolia(cvs);
  const stepFromLocalApi = useStepFromLocalApi(cvs);

  return useMemo(() => {
    if (!cvs) {
      return undefined;
    }

    const { info, versionInfo, ...stepDefaults } = stepFromAlgolia?.step || stepFromLocalApi?.step || {};

    const inputs = stepDefaults?.inputs?.map(({ opts, ...input }) => {
      const [inputName, defaultValue] = Object.entries(input)[0];

      const inputFromYml = stepFromYml?.inputs?.find(({ opts: _, ...inputObjectFromYml }) => {
        const inputNameFromYml = Object.keys(inputObjectFromYml)[0];
        return inputNameFromYml === inputName;
      });

      return { opts, [inputName]: inputFromYml?.[inputName] ?? defaultValue };
    });

    const mergedStep = { ...merge({}, stepDefaults, stepFromYml), inputs };

    return {
      cvs,
      step: mergedStep,
      isLoading: Boolean(stepFromAlgolia?.isLoading || stepFromLocalApi?.isLoading),
    };
  }, [cvs, stepFromAlgolia, stepFromLocalApi, stepFromYml]);
};

export default useStep;
