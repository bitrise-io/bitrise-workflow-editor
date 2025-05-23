import {
  Avatar,
  AvatarProps,
  Dropdown,
  DropdownDetailedOption,
  DropdownGroup,
  DropdownOption,
  Toggletip,
} from '@bitrise/bitkit';
import { ReactNode } from 'react';
import { Fragment } from 'react/jsx-runtime';

import { MachineTypeOption } from '@/core/models/MachineType';
import { MachineTypeWithValue } from '@/core/services/StackAndMachineService';

export const getMachineTypePromotionTexts = (isTrialMode: boolean) => {
  return isTrialMode
    ? {
        availableText: 'Available during the trial',
        promotedText: 'Available on paid plans',
        toggleTipText:
          'Select your machine type for builds. Options vary by plan. If you need stronger machines during your trial, contact sales.',
      }
    : {
        availableText: 'Available on your plan',
        promotedText: 'Available on other plans',
        toggleTipText:
          'Select your machine type for builds. Options vary by plan. If you need stronger machines contact sales.',
      };
};

type Props = {
  availableOptions: MachineTypeOption[];
  machineType: MachineTypeWithValue;
  onChange: (machineId: string) => void;
  promotedOptions: MachineTypeOption[];
  isLoading: boolean;
  isDisabled: boolean;
  isInvalid: boolean;
  isMachineTypePromotionTrialMode: boolean;
};

const MachineTypeSelector = ({
  machineType,
  availableOptions,
  isLoading,
  isDisabled,
  isInvalid,
  isMachineTypePromotionTrialMode,
  onChange,
  promotedOptions,
}: Props) => {
  const machineTypePromotion = getMachineTypePromotionTexts(isMachineTypePromotionTrialMode);

  const toggletip = (icon: ReactNode) => (
    <Toggletip
      button={{ href: 'https://bitrise.io/demo', label: 'Reach out to sales' }}
      label={machineTypePromotion.toggleTipText}
    >
      {icon}
    </Toggletip>
  );

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
      {[
        {
          isEnabled: true,
          label: machineTypePromotion.availableText,
          options: availableOptions,
        },
        {
          isEnabled: false,
          label: machineTypePromotion.promotedText,
          options: promotedOptions,
        },
      ].map(({ isEnabled, label, options }) => {
        const machineOptions = options?.map(({ label: optionLabel, value, osId }) => {
          if (!osId) {
            return (
              <DropdownOption isDisabled={!isEnabled} key={value} value={value}>
                {optionLabel}
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
              title={optionLabel}
              subtitle=""
            />
          );
        });

        const promotedMachinesExist = promotedOptions && promotedOptions.length > 0;

        return (
          <Fragment key={label}>
            {promotedMachinesExist ? <DropdownGroup label={label}>{machineOptions}</DropdownGroup> : machineOptions}
          </Fragment>
        );
      })}
    </Dropdown>
  );
};

export default MachineTypeSelector;
