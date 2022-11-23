import { ReactNode, useRef } from "react";
import ReactDOM from "react-dom";

import "./Portal.scss";

export const Portal = ({ children }: { children: ReactNode }): JSX.Element | null => {
	const ref = useRef<HTMLDivElement | null>(null);

	if (!ref.current) {
		ref.current = document.querySelector(".product-tour-portal");
	}

	if (ref.current) {
		return ReactDOM.createPortal(children, ref.current);
	}

	return null;
};
