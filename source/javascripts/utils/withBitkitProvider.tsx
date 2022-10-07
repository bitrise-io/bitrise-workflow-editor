import { theme } from "@bitrise/bitkit";
import { ReactNode } from "react";
import { ChakraProvider, mergeThemeOverride } from "@chakra-ui/react";
import createSharedContext from "./createSharedContext";


const wfeTheme = mergeThemeOverride(theme, {styles: { global: {svg: {display: "inline"}}}});

const Root = ({children}: {children: ReactNode}): JSX.Element => {
	return <ChakraProvider theme={wfeTheme}>{children}</ChakraProvider>;
};

const { component: BitkitRoot, use: withBitkitProvider } = createSharedContext(Root);

export { BitkitRoot, withBitkitProvider }
