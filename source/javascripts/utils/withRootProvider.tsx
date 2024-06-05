import { ReactNode } from 'react';
import { theme } from '@bitrise/bitkit';
import { ChakraProvider, mergeThemeOverride } from '@chakra-ui/react';

import createSharedContext from './createSharedContext';
import withQueryClientProvider from './withQueryClientProvider';

const wfeTheme = mergeThemeOverride(theme, {
  styles: {
    global: {
      svg: { display: 'inline' },
      select: { padding: '7px 32px 7px 12px' },
    },
  },
});

const Root = ({ children }: { children: ReactNode }): JSX.Element => {
  return <ChakraProvider theme={wfeTheme}>{children}</ChakraProvider>;
};

const { component: RootComponent, use: withRootProvider } = createSharedContext(withQueryClientProvider(Root));

export { RootComponent, withRootProvider };
