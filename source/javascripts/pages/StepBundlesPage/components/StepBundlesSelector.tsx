import { Text } from '@chakra-ui/react/text';

import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';

// The sidebar's Building blocks list picks the Step bundle now; the panel only names it.
const StepBundlesSelector = () => {
  const [selectedStepBundleId] = useSelectedStepBundle();

  return (
    <Text minWidth="0" textStyle="body/lg/semibold" truncate>
      {selectedStepBundleId || 'No Step bundle selected'}
    </Text>
  );
};

export default StepBundlesSelector;
