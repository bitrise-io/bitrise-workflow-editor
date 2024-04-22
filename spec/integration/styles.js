export const styleValues = {
	white: "rgb(255, 255, 255)",
	grey: "rgb(248, 248, 248)",
	purple: "rgb(123, 59, 165)",
	red: "rgb(255, 33, 88)",
	error: "rgb(215, 45, 64)",
};

export const styleValueSelector = (styleValueSelector) => styleValues[styleValueSelector] || styleValueSelector;
