import { Avatar, AvatarProps, Dropdown, DropdownDetailedOption, DropdownGroup, DropdownOption } from '@bitrise/bitkit';
import { Fragment } from 'react/jsx-runtime';

import { MachineTypeOption } from '@/core/models/MachineType';
import { MachineTypeWithValue } from '@/core/services/StackAndMachineService';

export const getMachineTypePromotionTexts = (isTrialMode: boolean) => {
  return isTrialMode
    ? {
        availableText: 'Available during the trial',
        promotedText: 'Available on paid plans',
      }
    : {
        availableText: 'Available on your plan',
        promotedText: 'Available on other plans',
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

  return (
    <Dropdown
      disabled={isLoading || isDisabled}
      errorText={isInvalid ? 'Invalid machine type' : undefined}
      helperText={machineType.creditPerMinute ? `${machineType.creditPerMinute} credits/min` : undefined}
      label="Machine type"
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
    // <Select
    //   isRequired
    //   label="Machine type"
    //   isLoading={isLoading}
    //   value={machineType.value}
    //   isDisabled={isDisabled}
    //   errorText={isInvalid ? 'Invalid machine type' : undefined}
    //   helperText={machineType.creditPerMinute ? `${machineType.creditPerMinute} credits/min` : undefined}
    //   onChange={(e) => onChange(e.target.value)}
    //   flex="1"
    // >
    //   {options.map(({ value, label }) => (
    //     <option key={value} value={value}>
    //       {label}
    //     </option>
    //   ))}
    // </Select>
  );
};

export default MachineTypeSelector;
