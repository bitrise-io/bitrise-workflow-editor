import maxSatisfying from 'semver/ranges/max-satisfying';
import defaultIcon from '../../../../images/step/icon-default.svg';
import useAlgoliaStep from '@/hooks/useAlgoliaStep';
import { isStepLib, normalizeStepVersion, parseStepCVS } from '@/models/Step';

type Props = {
  cvs: string;
  title?: string;
  icon?: string;
};

type StepCardData = {
  isLoading: boolean;
  title: string;
  icon: string;
  requestedVersion: string;
  normalizedVersion: string;
  resolvedVersion: string;
};

const useStepListItem = ({ cvs, title, icon }: Props): StepCardData => {
  const [id = '', version = ''] = parseStepCVS(cvs);
  const { data, isLoading } = useAlgoliaStep({
    id,
    enabled: isStepLib(cvs),
  });

  const versions = (data?.map((s) => s.version) ?? []) as string[];
  const normalizedVersion = normalizeStepVersion(version) || 'Always latest';
  const resolvedVersion = maxSatisfying(versions, normalizedVersion) || versions[0] || normalizedVersion;
  const defaultConfig = data?.find((s) => s.version === resolvedVersion);

  return {
    isLoading,
    title: title || defaultConfig?.step?.title || id,
    icon:
      icon ||
      defaultConfig?.step?.asset_urls?.['icon.svg'] ||
      defaultConfig?.step?.asset_urls?.['icon.png'] ||
      defaultConfig?.info?.asset_urls?.['icon.svg'] ||
      defaultConfig?.info?.asset_urls?.['icon.png'] ||
      defaultIcon,
    requestedVersion: version,
    normalizedVersion,
    resolvedVersion,
  };
};

export default useStepListItem;
