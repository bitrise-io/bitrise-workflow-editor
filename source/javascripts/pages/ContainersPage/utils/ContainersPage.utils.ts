import { BadgeProps } from '@bitrise/bitkit';

export const getContainersBadge = (count: number): BadgeProps => {
  if (count === 0) {
    return {
      colorScheme: 'neutral',
      children: `${count}`,
    };
  }

  return {
    colorScheme: 'progress',
    children: `${count}`,
  };
};
