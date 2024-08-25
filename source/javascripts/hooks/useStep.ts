import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import maxSatisfying from 'semver/ranges/max-satisfying';
import { useQuery } from '@tanstack/react-query';
import merge from 'lodash/merge';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { isGitStep, isLocalStep, isStepLib, normalizeStepVersion, parseStepCVS, Step } from '@/models/Step';
import useAlgoliaStep from '@/hooks/useAlgoliaStep';
import useAlgoliaStepInputs from '@/hooks/useAlgoliaStepInputs';
import { Maintainer } from '@/models/Algolia';
import defaultIcon from '@/../images/step/icon-default.svg';

type UseStepResult = {
  cvs: string;
  step?: Step;
  icon?: string;
  title?: string; // TODO: should be removed because confusing (use step.title instead)
  isLoading?: boolean;
  maintainer?: Maintainer;
  selectedVersion?: string;
  resolvedVersion?: string;
  availableVersions?: string[];
};

const useStepFromYml = (workflowId: string, stepIndex: number): UseStepResult => {
  return useBitriseYmlStore(
    useShallow(({ yml }) => {
      const stepObjectFromYml = yml.workflows?.[workflowId]?.steps?.[stepIndex];

      if (!stepObjectFromYml) {
        return { cvs: '' };
      }

      const [cvs, step] = Object.entries(stepObjectFromYml)[0];

      if (!isStepLib(cvs, step) && !isGitStep(cvs, step) && !isLocalStep(cvs, step)) {
        return { cvs };
      }

      return { cvs, step };
    }),
  );
};

const useStepFromAlgolia = (cvs = ''): UseStepResult => {
  const [id, version] = parseStepCVS(cvs);
  const { data: info, isLoading: isLoadingInfo } = useAlgoliaStep({
    id,
    enabled: Boolean(id && isStepLib(cvs)),
  });

  const versions = info?.map((s) => s.version ?? '');
  const latestVersion = info?.find((s) => s.is_latest)?.version;
  const selectedVersion = normalizeStepVersion(version ?? '');
  const resolvedVersion = !version ? latestVersion : maxSatisfying(versions ?? [], selectedVersion) || undefined;
  const resolvedStepInfo = info?.find((s) => s.version === resolvedVersion);

  const { data: inputs, isLoading: isLoadingInputs } = useAlgoliaStepInputs({
    cvs: resolvedStepInfo?.cvs ?? '',
    enabled: Boolean(resolvedStepInfo?.cvs),
  });

  return useMemo(() => {
    return {
      selectedVersion,
      resolvedVersion,
      availableVersions: versions,
      cvs: resolvedStepInfo?.cvs || cvs,
      step: { ...resolvedStepInfo?.step, inputs },
      isLoading: isLoadingInfo || isLoadingInputs,
      maintainer: resolvedStepInfo?.info?.maintainer,
      icon: resolvedStepInfo?.info?.asset_urls?.['icon.svg'] || resolvedStepInfo?.info?.asset_urls?.['icon.png'],
    };
  }, [cvs, inputs, isLoadingInfo, isLoadingInputs, resolvedStepInfo, resolvedVersion, selectedVersion, versions]);
};

const useStepFromLocalApi = (cvs = ''): UseStepResult => {
  const [id, version] = parseStepCVS(cvs);

  let library: string = '';
  if (isLocalStep(cvs)) {
    library = 'path';
  } else if (isGitStep(cvs)) {
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
      selectedVersion: version,
      resolvedVersion: version,
      icon: data?.info?.asset_urls?.['icon.svg'] || data?.info?.asset_urls?.['icon.png'],
    };
  }, [cvs, isLoading, data, version]);
};

const useStep = (workflowId: string, stepIndex: number): UseStepResult | undefined => {
  const { cvs, step: stepFromYml } = useStepFromYml(workflowId, stepIndex);

  const stepFromAlgolia = useStepFromAlgolia(cvs);
  const stepFromLocalApi = useStepFromLocalApi(cvs);

  return useMemo(() => {
    if (!cvs) {
      return undefined;
    }

    const stepDefaults = stepFromAlgolia?.step || stepFromLocalApi?.step;

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
      title: mergedStep.title || cvs,
      maintainer: stepFromAlgolia?.maintainer,
      availableVersions: stepFromAlgolia?.availableVersions,
      isLoading: stepFromAlgolia?.isLoading || stepFromLocalApi?.isLoading,
      selectedVersion: stepFromAlgolia?.selectedVersion || stepFromLocalApi?.selectedVersion,
      resolvedVersion: stepFromAlgolia?.resolvedVersion || stepFromLocalApi?.resolvedVersion,
      icon:
        mergedStep?.asset_urls?.['icon.svg'] ||
        mergedStep?.asset_urls?.['icon.png'] ||
        stepFromAlgolia?.icon ||
        stepFromLocalApi?.icon ||
        defaultIcon,
    };
  }, [cvs, stepFromAlgolia, stepFromLocalApi, stepFromYml]);
};

export default useStep;
