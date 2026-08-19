import { CiConfigExpertAvailability } from '@/typings/globals';

const withCiConfigExpert = (availability: CiConfigExpertAvailability) => ({
  ...window.parent.pageProps,
  settings: {
    ai: {
      ciConfigExpert: { availability, options: { wfeIntegration: availability === 'enabled' } },
      failedBuilds: {
        disabled: 'by-project' as const,
        options: undefined,
      },
      fixer: {
        disabled: 'by-project' as const,
        options: undefined,
      },
    },
  },
});

export const aiButtonEnabled = () => withCiConfigExpert('enabled');

export const aiButtonUnavailable = () => withCiConfigExpert('unavailable');
