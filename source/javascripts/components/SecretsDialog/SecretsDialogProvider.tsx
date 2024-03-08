import { useDisclosure } from "@bitrise/bitkit";
import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

import SecretsDialog from "./SecretsDialog";
import { Secret } from "./types";

type HandlerFn = (secret: Secret) => void;
type Props = PropsWithChildren<{ defaultSecrets?: Secret[] }>;
type State = { open: (options: { source: string; onSelect: HandlerFn; onCreate: HandlerFn }) => void };

const Context = createContext<State>({ open: () => undefined });

const SecretsDialogProvider = ({ children, defaultSecrets = [] }: Props) => {
	const { isOpen, onClose, onOpen } = useDisclosure();
	const [secrets, setSecrets] = useState(defaultSecrets);

	const [dynamicProps, setDynamicProps] = useState<{ source: string; onSelect: HandlerFn; onCreate: HandlerFn }>({
		source: "",
		onSelect: () => undefined,
		onCreate: () => undefined,
	});

	const value = useMemo(() => {
		const open: State["open"] = (options) => {
			setDynamicProps({
				...options,
				onCreate: (secret) => {
					options.onCreate(secret);
					setSecrets((s) => [...s, secret].sort((a, b) => a.key.localeCompare(b.key)));
				},
			});

			onOpen();
		};

		return { open } as State;
	}, []);

	return (
		<Context.Provider value={value}>
			{children}
			<SecretsDialog isOpen={isOpen} secrets={secrets} onClose={onClose} {...dynamicProps} />
		</Context.Provider>
	);
};

export const useSecretsDialog = () => useContext(Context);

export default SecretsDialogProvider;
