/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect } from "react";
import { useCallback, useState } from "react";
import { Highlighter, useHighlighter } from "./Highlighter";
import { ProductTooltip } from "./ProductTooltip";
import { ProductTourProps, Tips } from "./types";
import { useTrackingFunction } from "./useTrackingFunction";
import { tips } from "./tips";
import { useWaitForElements } from "./useWaitForElement";

export const ProductTourContent = ({ menuIds, currentUser }: ProductTourProps) => {
	const [isOpen, setIsOpen] = useState(true);
	const [validTips, setValidTips] = useState<Tips[] | null>(null);
	const [selectedId, setSelectedId] = useState("");

	const onFound = useCallback(() => {
		const filtered = tips.filter(tip => menuIds.includes(tip.id));
		setValidTips(filtered);
		setSelectedId(filtered[0].id);
	}, []);

	// NOTE: Angular passes the menu items ids it will render,
	// but we stil need to wait for the templates to render them before we can move on.
	useWaitForElements(menuIds, onFound);

	const { rect, clipPath, highlighted } = useHighlighter(selectedId);

	const onDisplayTooltip = useTrackingFunction(() => ({
		event: "tooltip_displayed",
		payload: {
			user_slug: currentUser.slug,
			user_id: currentUser.dataId,
			location: "workflow_editor",
			name: selectedId
		}
	}));

	const onTrackClose = useTrackingFunction(() => ({
		event: "tooltip_closed",
		payload: {
			user_slug: currentUser.slug,
			user_id: currentUser.dataId,
			location: "workflow_editor",
			name: selectedId
		}
	}));

	const onClose = () => {
		setIsOpen(false);
		onTrackClose();
	};

	useEffect(() => {
		if (isOpen && !!selectedId && highlighted) {
			onDisplayTooltip();
		}
	}, [isOpen, highlighted, onDisplayTooltip, selectedId]);

	const onChange = useCallback(id => {
		setSelectedId(id);
	}, []);

	if (!validTips) {
		return null;
	}

	return (
		<Highlighter isOpen={isOpen} rect={rect!} clipPath={clipPath}>
			<ProductTooltip onChange={onChange} onClose={onClose} rect={rect} tips={validTips} />
		</Highlighter>
	);
};

export const ProductTour = ({ menuIds, currentUser }: ProductTourProps) => {
	if (currentUser?.tourShown !== false) {
		return null;
	}

	return <ProductTourContent menuIds={menuIds} currentUser={currentUser} />;
};
