import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toMerged } from 'es-toolkit';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { Step, StepBundle, StepLike, StepLikeYmlObject, WithGroup } from '@/core/models/Step';
import StepService from '@/core/models/StepService';
import StepApi, { StepApiResult } from '@/core/api/StepApi';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';

type YmlStepResult = {
  data?: StepLike;
};

function useStepFromYml(props: UseStepProps): YmlStepResult {
  const defaultStepLibrary = useDefaultStepLibrary();
  return useBitriseYmlStore(({ yml }) => {
    let stepObjectFromYml: StepLikeYmlObject | undefined;
    if (isWorkflowProps(props)) {
      const { workflowId, stepIndex } = props;
      stepObjectFromYml = yml.workflows?.[workflowId]?.steps?.[stepIndex];
    } else {
      const { stepBundleId, stepIndex } = props;
      stepObjectFromYml = yml.step_bundles?.[stepBundleId]?.steps?.[stepIndex];
    }

    if (!stepObjectFromYml) {
      return { data: undefined };
    }

    const [cvs, step] = Object.entries(stepObjectFromYml)[0];

    if (!step) {
      return { data: undefined };
    }

    const { id } = StepService.parseStepCVS(cvs, defaultStepLibrary);
    const title = StepService.resolveTitle(cvs, defaultStepLibrary, step);
    const icon = StepService.resolveIcon(cvs, defaultStepLibrary, step);

    if (StepService.isWithGroup(cvs, defaultStepLibrary, step)) {
      return { data: { cvs, id, title, icon, userValues: step } };
    }
    if (StepService.isStepBundle(cvs, defaultStepLibrary, step)) {
      return { data: { cvs, id, title, icon, userValues: step } };
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
  data?: Step | WithGroup | StepBundle;
  error?: Error | null;
};

type UseWorkflowStepProps = {
  workflowId: string;
  stepIndex: number;
};

type UseStepBundleProps = {
  stepBundleId: string;
  stepIndex: number;
};

type UseStepProps = UseWorkflowStepProps | UseStepBundleProps;

const isWorkflowProps = (props: UseStepProps): props is UseWorkflowStepProps => {
  return 'workflowId' in props;
};

const useStep = (props: UseStepProps): UseStepResult => {
  const { stepIndex } = props;
  const defaultStepLibrary = useDefaultStepLibrary();
  const { data: ymlData } = useStepFromYml(props);
  const { data: apiData, error, isLoading } = useStepFromApi(ymlData?.cvs ?? '');

  if (isWorkflowProps(props)) {
    const { workflowId } = props;
  }

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
        data: ymlData as StepBundle,
        isLoading: false,
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
