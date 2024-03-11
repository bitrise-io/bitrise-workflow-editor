import { useDisclosure } from "@bitrise/bitkit";
import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

import EnvironmentVariablesDialog from "./EnvironmentVariablesDialog";
import { EnvironmentVariable, HandlerFn } from "./types";

type State = { open: (options: { onSelect: HandlerFn }) => void };
type Props = PropsWithChildren<{ environmentVariables?: EnvironmentVariable[] }>;

const Context = createContext<State>({ open: () => undefined });

const EnvironmentVariablesDialogProvider = ({ children, environmentVariables = [] }: Props) => {
	const { isOpen, onClose, onOpen } = useDisclosure();

	const [dynamicProps, setDynamicProps] = useState<{ onSelect: HandlerFn }>({
		onSelect: () => undefined,
	});

	const value = useMemo(() => {
		const open: State["open"] = (options) => {
			onOpen();
			setDynamicProps(options);
		};

		return { open } as State;
	}, []);

	return (
		<Context.Provider value={value}>
			{children}
			<EnvironmentVariablesDialog
				isOpen={isOpen}
				onClose={onClose}
				environmentVariables={environmentVariables}
				{...dynamicProps}
			/>
		</Context.Provider>
	);
};

export const useEnvironmentVariablesDialog = () => useContext(Context);

export default EnvironmentVariablesDialogProvider;
