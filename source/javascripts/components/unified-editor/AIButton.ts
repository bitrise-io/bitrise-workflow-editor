type CiConfigExpertProps = {
  disabled?: 'by-project' | 'by-workspace' | 'unsupported';
  options?: { wfeIntegration: boolean };
};

const withCiConfigExpert = ({ disabled, options }: CiConfigExpertProps = {}) => ({
  ...window.parent.pageProps,
  settings: {
    ai: {
      ciConfigExpert: disabled ? { disabled, options } : { options: options ?? { wfeIntegration: false } },
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

export const aiButtonEnabled = () => withCiConfigExpert({ options: { wfeIntegration: true } });

export const aiButtonDisabled = () => withCiConfigExpert({ disabled: 'by-project' });

export const aiButtonHidden = () => withCiConfigExpert({ disabled: 'by-workspace' });
