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

export const aiButtonDisabled = () => withCiConfigExpert('disabled-by-project');

export const aiButtonHidden = () => withCiConfigExpert('disabled-by-workspace');

export const aiButtonUnavailable = () => withCiConfigExpert('unavailable');
