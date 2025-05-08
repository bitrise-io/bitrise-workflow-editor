import { Box, FilterSwitch, FilterSwitchGroup, Label } from '@bitrise/bitkit';
import { useState } from 'react';

import EditorWrapper from './EditorWrapper';
import StepMaker from './StepMaker';

type Props = {
  label?: string;
  value: string;
  defaultValue?: string;
  onChange: (value: string | null) => void;
};

const StepCodeEditor = ({ label, value, defaultValue, onChange }: Props) => {
  const [state, setState] = useState<'script' | 'ai'>('script');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBlockEnd="8">
        {label && <Label>{label}</Label>}
        <FilterSwitchGroup onChange={(v) => setState(v as 'script' | 'ai')} value={state} marginBlockStart="0">
          <FilterSwitch value="script">Script</FilterSwitch>
          <FilterSwitch value="ai">AI input</FilterSwitch>
        </FilterSwitchGroup>
      </Box>
      <Box display={state === 'ai' ? 'none' : 'block'}>
        <EditorWrapper defaultValue={defaultValue} value={value} onChange={onChange} />
      </Box>
      <Box display={state === 'ai' ? 'block' : 'none'}>
        <StepMaker onChange={onChange} />
      </Box>
    </Box>
  );
};

export default StepCodeEditor;
