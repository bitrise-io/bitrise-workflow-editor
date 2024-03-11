import { useDisclosure } from "@bitrise/bitkit";
import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

import SecretsDialog from "./SecretsDialog";
import { HandlerFn, Secret } from "./types";

type State = { open: (options: { source: string; onSelect: HandlerFn }) => void };
type Props = PropsWithChildren<{ defaultSecrets?: Secret[]; onCreate: HandlerFn }>;

const Context = createContext<State>({ open: () => undefined });

const SecretsDialogProvider = ({ children, defaultSecrets = [], onCreate }: Props) => {
	const { isOpen, onClose, onOpen } = useDisclosure();
	const [secrets, setSecrets] = useState(defaultSecrets);

	const [dynamicProps, setDynamicProps] = useState<{ source: string; onSelect: HandlerFn }>({
		source: "",
		onSelect: () => undefined,
	});

	const value = useMemo(() => {
		const open: State["open"] = (options) => {
			onOpen();
			setDynamicProps(options);
		};

		return { open } as State;
	}, []);

	const handleCreate = (secret: Secret) => {
		onCreate(secret);
		setSecrets((s) => [...s, secret]);
	};

	return (
		<Context.Provider value={value}>
			{children}
			<SecretsDialog isOpen={isOpen} secrets={secrets} onClose={onClose} onCreate={handleCreate} {...dynamicProps} />
		</Context.Provider>
	);
};

export const useSecretsDialog = () => useContext(Context);

export default SecretsDialogProvider;
