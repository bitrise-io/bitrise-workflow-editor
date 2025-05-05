import { BoxProps, SearchInput } from '@bitrise/bitkit';

import useSearch from '../hooks/useSearch';

type Props = BoxProps;

const StepBundleFilter = (props: Props) => {
  const value = useSearch((s) => s.stepBundleQuery);
  const onChange = useSearch((s) => s.setSearchStepBundle);

  return <SearchInput autoFocus placeholder="Filter by name..." {...props} value={value} onChange={onChange} />;
};

export default StepBundleFilter;
