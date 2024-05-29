import semver from 'semver';
import defaultIcon from '../../../../images/step/icon-default.svg';
import { isStepLib, normalizeVersion, parseCvs } from '../utils/steps';
import useSearchStep from './useSearchStep';

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

const useStepCardData = ({ cvs, title, icon }: Props): StepCardData => {
  const [id = '', version = ''] = parseCvs(cvs);
  const { data, isLoading } = useSearchStep({
    id,
    enabled: isStepLib(cvs),
    attributesToRetrieve: ['id', 'version', 'cvs', 'step.title', 'info.asset_urls', 'step.asset_urls'],
  });

  const versions = (data?.map((s) => s.version) ?? []) as string[];
  const normalizedVersion = normalizeVersion(version) || 'Always latest';
  const resolvedVersion = semver.maxSatisfying(versions, normalizedVersion) || versions[0] || normalizedVersion;
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

export default useStepCardData;
