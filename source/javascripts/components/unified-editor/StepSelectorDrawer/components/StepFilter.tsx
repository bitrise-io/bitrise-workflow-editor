import { memo, useCallback, useMemo } from 'react';
import {
  Box,
  BoxProps,
  Button,
  ButtonGroup,
  SearchInput,
  SelectableTag,
  SelectableTagGroup,
  Tooltip,
  TypeIconName,
} from '@bitrise/bitkit';

import { capitalize, startCase } from 'es-toolkit';
import { useAlgoliaSteps } from '@/hooks/useAlgolia';
import StepService from '@/core/models/StepService';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useSearch from '../hooks/useSearch';

const StepFilterCategories = memo(() => {
  const { data: steps = [] } = useAlgoliaSteps();
  const categories = useMemo(() => StepService.getStepCategories(steps), [steps]);

  const value = useSearch((s) => s.stepCategoryFilter);
  const onChange = useSearch((s) => s.setSearchStepCategories);

  return (
    <SelectableTagGroup rowGap="16" columnGap="8" display="flex" flexWrap="wrap" value={value} onChange={onChange}>
      {categories.map((category) => (
        <SelectableTag key={category} value={category}>
          {capitalize(startCase(category))}
        </SelectableTag>
      ))}
    </SelectableTagGroup>
  );
});

type MaintainerOption = {
  key: 'bitrise' | 'verified' | 'community';
  icon: TypeIconName;
  label: string;
  tooltip: string;
};

const MAINTAINERS: MaintainerOption[] = [
  {
    key: 'bitrise',
    icon: 'BadgeBitrise',
    label: 'Official',
    tooltip: 'Official Bitrise steps are maintained by the Bitrise team',
  },
  {
    key: 'verified',
    icon: 'Badge3rdParty',
    label: 'Verified',
    tooltip: 'Verified steps are maintained by 3rd parties, and are verified by Bitrise',
  },
  {
    key: 'community',
    icon: 'Dudes',
    label: 'Community',
    tooltip: 'Community steps are maintained by the community and not are verified',
  },
];

const StepMaintainerFilter = memo(() => {
  const value = useSearch((s) => s.stepMaintainerFilter);
  const onChange = useSearch((s) => s.setSearchStepMaintainers);

  const toggleMaintainer = useCallback(
    (maintainer: string) => {
      if (value.includes(maintainer)) {
        onChange([...value.filter((v) => v !== maintainer)]);
      } else {
        onChange([...value, maintainer]);
      }
    },
    [value, onChange],
  );

  return (
    <ButtonGroup isAttached>
      {MAINTAINERS.map(({ key, icon, label, tooltip }) => (
        <Tooltip key={key} label={tooltip}>
          <Button
            key={key}
            size="sm"
            flexGrow={1}
            variant="secondary"
            leftIconName={icon}
            isActive={value.includes(key)}
            aria-label={tooltip}
            onClick={() => toggleMaintainer(key)}
          >
            {label}
          </Button>
        </Tooltip>
      ))}
    </ButtonGroup>
  );
});

const StepFilter = (props: BoxProps) => {
  const algoliaSearchEnabled = useFeatureFlag('enable-algolia-search-for-steps');

  const value = useSearch((s) => s.stepQuery);
  const onChange = useSearch((s) => s.setSearchStep);

  return (
    <Box display="flex" flexDir="column" gap="16" {...props}>
      <SearchInput autoFocus placeholder="Filter by name or description..." value={value} onChange={onChange} />
      {algoliaSearchEnabled && <StepMaintainerFilter />}
      <StepFilterCategories />
    </Box>
  );
};

export default StepFilter;
