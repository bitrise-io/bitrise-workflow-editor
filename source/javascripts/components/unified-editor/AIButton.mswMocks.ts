export const aiButtonEnabled = () => ({
  ...window.parent.pageProps,
  settings: {
    ai: {
      ciConfigExpert: {
        options: { wfeIntegration: true },
      },
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

export const aiButtonDisabled = () => ({
  ...window.parent.pageProps,
  settings: {
    ai: {
      ciConfigExpert: {
        disabled: 'by-project' as const,
        options: undefined,
      },
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

export const aiButtonHidden = () => ({
  ...window.parent.pageProps,
  settings: {
    ai: {
      ciConfigExpert: {
        disabled: 'by-workspace' as const,
        options: undefined,
      },
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
