import { ReactNode } from 'react';
import { theme } from '@bitrise/bitkit';
import { ChakraProvider, mergeThemeOverride } from '@chakra-ui/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import createSharedContext from './createSharedContext';

const queryClient = new QueryClient();

const wfeTheme = mergeThemeOverride(theme, {
  styles: {
    global: {
      svg: { display: 'inline' },
      select: { padding: '7px 32px 7px 12px' },
    },
  },
});

const Root = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={wfeTheme}>{children}</ChakraProvider>
    </QueryClientProvider>
  );
};

const { component: BitkitRoot, use: withBitkitProvider } = createSharedContext(Root);

export { BitkitRoot, withBitkitProvider };
