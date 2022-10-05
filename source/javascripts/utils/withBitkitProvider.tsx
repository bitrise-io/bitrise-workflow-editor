import { Provider } from "@bitrise/bitkit";
import { ReactNode } from "react";
import createSharedContext from "react2angular-shared-context"

const Root = ({children}: {children: ReactNode}) => {
	return <Provider>{children}</Provider>;
};

const { component: BitkitRoot, use: withBitkitProvider } = createSharedContext(Root);

export { BitkitRoot, withBitkitProvider }
