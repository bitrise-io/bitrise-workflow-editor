import { BitkitSearchInput, BitkitSearchInputProps } from '@bitrise/bitkit-v2';

import useSearch from '../hooks/useSearch';

type Props = Omit<BitkitSearchInputProps, 'onChange' | 'value'>;

const StepBundleFilter = (props: Props) => {
  const value = useSearch((s) => s.stepBundleQuery);
  const onChange = useSearch((s) => s.setSearchStepBundle);

  return <BitkitSearchInput autoFocus placeholder="Filter by name..." {...props} value={value} onChange={onChange} />;
};

export default StepBundleFilter;
