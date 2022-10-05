import { Provider } from "@bitrise/bitkit";
import { ReactNode } from "react";
import createCache from "@emotion/cache";
import createSharedContext from "react2angular-shared-context"
import { CacheProvider } from "@emotion/react";

const cache = createCache({key: "wfe", prepend:true});
const Root = ({children}: {children: ReactNode}) => {
	return <CacheProvider value={cache}><Provider>{children}</Provider></CacheProvider>;
};

const { component: BitkitRoot, use: withBitkitProvider } = createSharedContext(Root);

export { BitkitRoot, withBitkitProvider }
