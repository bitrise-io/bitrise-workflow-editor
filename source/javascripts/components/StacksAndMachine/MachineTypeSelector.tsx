import { Avatar, Dropdown, DropdownDetailedOption, DropdownGroup, Toggletip, TypeIconName } from '@bitrise/bitkit';
import { ReactNode } from 'react';

import { MachineTypeOption } from '@/core/models/MachineType';
import { MachineTypeWithValue } from '@/core/services/StackAndMachineService';

export const PROMOTION_TEXTS = {
  trial: {
    availableText: 'Available during the trial',
    promotedText: 'Available on paid plans',
    toggleTipText:
      'Select your machine type for builds. Options vary by plan. If you need stronger machines during your trial, contact sales.',
  },
  upsell: {
    availableText: 'Available on your plan',
    promotedText: 'Available on other plans',
    toggleTipText:
      'Select your machine type for builds. Options vary by plan. If you need stronger machines contact sales.',
  },
};

const getIconName = (osId?: string): TypeIconName | undefined => {
  switch (osId) {
    case 'linux':
      return 'Linux';
    case 'osx':
      return 'Apple';
    default:
      return undefined;
  }
};

const renderOptions = (machines: MachineTypeOption[], isDisabled?: boolean) => {
  return machines.map((machine) => {
    const iconName = getIconName(machine.osId);
    return (
      <DropdownDetailedOption
        key={machine.value}
        value={machine.value}
        title={machine.label}
        subtitle=""
        isDisabled={isDisabled}
        icon={iconName && <Avatar variant="brand" size="24" iconName={iconName} />}
      />
    );
  });
};

type Props = {
  isLoading: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
  machineType: MachineTypeWithValue;
  availableOptions: MachineTypeOption[];
  promotionType?: 'trial' | 'upsell';
  promotedOptions: MachineTypeOption[];
  onChange: (machineId: string) => void;
};

const MachineTypeSelector = ({
  isLoading,
  isInvalid,
  isDisabled,
  machineType,
  availableOptions,
  promotedOptions,
  promotionType,
  onChange,
}: Props) => {
  const toggletip = (icon: ReactNode) => {
    if (!promotionType) {
      return null;
    }

    return (
      <Toggletip
        label={PROMOTION_TEXTS[promotionType].toggleTipText}
        button={{ href: 'https://bitrise.io/demo', label: 'Reach out to sales' }}
      >
        {icon}
      </Toggletip>
    );
  };

  const hasPromotion = promotionType && promotedOptions.length > 0;

  return (
    <Dropdown
      flex="1"
      required
      search={false}
      label="Machine type"
      labelHelp={toggletip}
      disabled={isLoading || isDisabled}
      errorText={isInvalid ? 'Invalid machine type' : undefined}
      helperText={machineType.creditPerMinute ? `${machineType.creditPerMinute} credits/min` : undefined}
      onChange={(e) => onChange(e.target.value as string)}
      value={machineType.value}
    >
      {!hasPromotion ? (
        renderOptions(availableOptions)
      ) : (
        <>
          <DropdownGroup label={PROMOTION_TEXTS[promotionType].availableText}>
            {renderOptions(availableOptions)}
          </DropdownGroup>
          <DropdownGroup label={PROMOTION_TEXTS[promotionType].promotedText}>
            {renderOptions(promotedOptions, true)}
          </DropdownGroup>
        </>
      )}
    </Dropdown>
  );
};

export default MachineTypeSelector;
