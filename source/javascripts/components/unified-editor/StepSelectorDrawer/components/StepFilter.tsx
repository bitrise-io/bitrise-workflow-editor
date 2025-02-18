import { memo, useCallback, useMemo } from 'react';
import {
  Box,
  BoxProps,
  Divider,
  Icon,
  SearchInput,
  SelectableTag,
  SelectableTagGroup,
  TypeIconName,
} from '@bitrise/bitkit';

import { capitalize, startCase } from 'es-toolkit';
import { useAlgoliaSteps } from '@/hooks/useAlgolia';
import StepService from '@/core/services/StepService';
import useSearch from '../hooks/useSearch';

const MAINTAINERS: Array<{
  key: 'bitrise' | 'verified' | 'community';
  icon: TypeIconName;
  label: string;
  tooltip: string;
}> = [
  {
    key: 'bitrise',
    icon: 'BadgeBitrise',
    label: 'Official',
    tooltip: 'Official Bitrise steps are maintained by the Bitrise',
  },
  {
    key: 'verified',
    icon: 'Badge3rdParty',
    label: 'Verified',
    tooltip: 'Verified steps are maintained by 3rd parties, and verified by Bitrise',
  },
  {
    key: 'community',
    icon: 'Globe',
    label: 'Community',
    tooltip: 'Community steps are maintained by the community and are not verified',
  },
];

const StepFilterCategories = memo(() => {
  const { data: steps = [] } = useAlgoliaSteps();
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
    <SelectableTagGroup value={options} onChange={handleFilterChange}>
      <Box rowGap="16" columnGap="8" display="flex" flexWrap="wrap">
        {categories.map((category) => (
          <SelectableTag key={category} value={category}>
            {capitalize(startCase(category))}
          </SelectableTag>
        ))}
        <Divider orientation="vertical" height="auto" />
        {MAINTAINERS.map(({ key, icon, label }) => (
          <SelectableTag key={key} value={key}>
            <Icon name={icon} size="16" marginRight="2" marginBottom={2} />
            {label}
          </SelectableTag>
        ))}
      </Box>
    </SelectableTagGroup>
  );
});

const StepFilter = (props: BoxProps) => {
  const value = useSearch((s) => s.stepQuery);
  const onChange = useSearch((s) => s.setSearchStep);

  return (
    <Box display="flex" flexDir="column" gap="16" {...props}>
      <SearchInput autoFocus placeholder="Filter by name or description..." value={value} onChange={onChange} />
      <Box display="flex" flexWrap="wrap" gap="16">
        <StepFilterCategories />
      </Box>
    </Box>
  );
};

export default StepFilter;
