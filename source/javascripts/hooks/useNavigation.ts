import FirstBuildingBlock from '@/components/Navigation/firstBuildingBlock';
import { isToolPath } from '@/components/Navigation/lastBlock';

import useHashLocation from './useHashLocation';
import { getSearchParamsFromLocationHash } from './useSearchParams';

// A tool opens in a panel over the page you're on, which stays on screen: going to one keeps that page's
// selected entity (Workflow, Pipeline, Step bundle) in the URL, so the page behind doesn't switch.
const entityParamsKeptFor = (path: string): Record<string, string> => {
  if (!isToolPath(path)) {
    return {};
  }
  const current = getSearchParamsFromLocationHash();
  return Object.fromEntries(
    FirstBuildingBlock.entityParams.filter((param) => current[param]).map((param) => [param, current[param]]),
  );
};

const useNavigation = () => {
  const [, navigate] = useHashLocation();

  const replace = (path: string, params?: Record<string, string>) => {
    const query = new URLSearchParams({ ...entityParamsKeptFor(path), ...params }).toString();
    navigate(`${path}${query ? `?${query}` : ''}`);
  };

  return { replace };
};

export default useNavigation;
