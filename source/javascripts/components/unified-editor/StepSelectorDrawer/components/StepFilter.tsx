import { SearchInput } from '@bitrise/bitkit';
import {
  BitkitIconComponent,
  BitkitSelectableTag,
  IconBadge3RdParty,
  IconBadgeBitrise,
  IconGlobe,
} from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { Separator } from '@chakra-ui/react/separator';
import { capitalize, startCase } from 'es-toolkit';
import { memo, useCallback, useMemo } from 'react';

import StepService from '@/core/services/StepService';
import PageProps from '@/core/utils/PageProps';
import { useAlgoliaSteps } from '@/hooks/useAlgolia';

import useSearch from '../hooks/useSearch';

const MAINTAINERS: Array<{
  key: 'bitrise' | 'verified' | 'community';
  icon: BitkitIconComponent;
  label: string;
  tooltip: string;
}> = [
  {
    key: 'bitrise',
    icon: IconBadgeBitrise,
    label: 'Official',
    tooltip: 'Official Bitrise steps are maintained by the Bitrise',
  },
  {
    key: 'verified',
    icon: IconBadge3RdParty,
    label: 'Verified',
    tooltip: 'Verified steps are maintained by 3rd parties, and verified by Bitrise',
  },
  {
    key: 'community',
    icon: IconGlobe,
    label: 'Community',
    tooltip: 'Community steps are maintained by the community and are not verified',
  },
];

const StepFilterCategories = memo(function StepFilterCategories() {
  const allowNonBitriseSteps = PageProps.limits()?.allowNonBitriseSteps ?? true;
  const allowedMaintainers = allowNonBitriseSteps ? [] : ['bitrise'];
  const { data: steps = [] } = useAlgoliaSteps(allowedMaintainers);
  const categories = useMemo(() => StepService.getStepCategories(steps), [steps]);
  const selectedCategories = useSearch((s) => s.stepCategoryFilter);
  const selectedMaintainers = useSearch((s) => s.stepMaintainerFilter);
  const setSelectedCategories = useSearch((s) => s.setSearchStepCategories);
  const setSelectedMaintainers = useSearch((s) => s.setSearchStepMaintainers);

  const options = useMemo(
    () => [...selectedCategories, ...selectedMaintainers],
    [selectedCategories, selectedMaintainers],
  );

  const handleFilterChange = useCallback(
    (values: string[]) => {
      const cats = values.filter((v) => categories.some((c) => c === v));
      const mans = values.filter((v) => MAINTAINERS.some((m) => m.key === v));

      setSelectedCategories(cats);
      setSelectedMaintainers(mans);
    },
    [categories, setSelectedCategories, setSelectedMaintainers],
  );

  return (
    <BitkitSelectableTag value={options} onValueChange={handleFilterChange}>
      {categories.map((category) => (
        <BitkitSelectableTag.Item key={category} value={category}>
          {capitalize(startCase(category))}
        </BitkitSelectableTag.Item>
      ))}
      {allowNonBitriseSteps && <Separator orientation="vertical" />}
      {allowNonBitriseSteps &&
        MAINTAINERS.map(({ key, icon, label }) => (
          <BitkitSelectableTag.Item key={key} icon={icon} value={key}>
            {label}
          </BitkitSelectableTag.Item>
        ))}
    </BitkitSelectableTag>
  );
});

const StepFilter = (props: BoxProps) => {
  const value = useSearch((s) => s.stepQuery);
  const onChange = useSearch((s) => s.setSearchStep);

  return (
    <Box display="flex" flexDirection="column" gap="16" {...props}>
      <SearchInput autoFocus placeholder="Filter by name or description..." value={value} onChange={onChange} />
      <Box display="flex" flexWrap="wrap" gap="16">
        <StepFilterCategories />
      </Box>
    </Box>
  );
};

export default StepFilter;
