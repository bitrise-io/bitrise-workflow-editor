import {
  Avatar,
  AvatarProps,
  Dropdown,
  DropdownDetailedOption,
  DropdownGroup,
  DropdownOption,
  Toggletip,
} from '@bitrise/bitkit';
import { ReactNode, useMemo } from 'react';
import { Fragment } from 'react/jsx-runtime';

import { MachineTypeOption } from '@/core/models/MachineType';
import { MachineTypeWithValue } from '@/core/services/StackAndMachineService';

export const promotionTexts = {
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

const getMachineTypeDropdownOptions = ({
  isEnabled,
  machineTypeOptions,
}: {
  isEnabled: boolean;
  machineTypeOptions: MachineTypeOption[];
}) => {
  return machineTypeOptions.map(({ label, osId, value }) => {
    if (!osId) {
      return (
        <DropdownOption isDisabled={!isEnabled} key={value} value={value}>
          {label}
        </DropdownOption>
      );
    }

    let iconName: AvatarProps['iconName'] = 'Other';
    switch (osId) {
      case 'linux': {
        iconName = 'Linux';
        break;
      }
      case 'osx': {
        iconName = 'Apple';
        break;
      }
    }

    return (
      <DropdownDetailedOption
        isDisabled={!isEnabled}
        key={value}
        value={value}
        icon={<Avatar variant="brand" size="24" iconName={iconName} />}
        title={label}
        subtitle=""
      />
    );
  });
};

type Props = {
  availableOptions: MachineTypeOption[];
  machineType: MachineTypeWithValue;
  onChange: (machineId: string) => void;
  promotedOptions: MachineTypeOption[];
  isLoading: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
  machineTypePromotionMode?: 'trial' | 'upsell';
};

const MachineTypeSelector = ({
  machineType,
  availableOptions,
  isLoading,
  isDisabled,
  isInvalid,
  machineTypePromotionMode,
  onChange,
  promotedOptions,
}: Props) => {
  const machineTypePromotion = useMemo(() => {
    if (!machineTypePromotionMode) {
      return null;
    }

    return promotionTexts[machineTypePromotionMode];
  }, [machineTypePromotionMode]);

  const toggletip = (icon: ReactNode) => {
    if (!machineTypePromotion) {
      return null;
    }

    return (
      <Toggletip
        button={{
          href: 'https://bitrise.io/demo',
          label: 'Reach out to sales',
        }}
        label={machineTypePromotion.toggleTipText}
      >
        {icon}
      </Toggletip>
    );
  };

  return (
    <Dropdown
      disabled={isLoading || isDisabled}
      errorText={isInvalid ? 'Invalid machine type' : undefined}
      helperText={machineType.creditPerMinute ? `${machineType.creditPerMinute} credits/min` : undefined}
      label="Machine type"
      labelHelp={toggletip}
      onChange={(e) => onChange(e.target.value as string)}
      required
      search={false}
      value={machineType.value}
    >
      {machineTypePromotion && promotedOptions && promotedOptions.length > 0
        ? [
            {
              isEnabled: true,
              label: machineTypePromotion.availableText,
              machines: availableOptions,
            },
            {
              isEnabled: false,
              label: machineTypePromotion.promotedText,
              machines: promotedOptions,
            },
          ].map(({ isEnabled, label, machines }) => {
            return (
              <Fragment key={label}>
                <DropdownGroup label={label}>
                  {getMachineTypeDropdownOptions({
                    isEnabled,
                    machineTypeOptions: machines,
                  })}
                </DropdownGroup>
              </Fragment>
            );
          })
        : getMachineTypeDropdownOptions({
            isEnabled: true,
            machineTypeOptions: availableOptions,
          })}
    </Dropdown>
  );
};

export default MachineTypeSelector;
