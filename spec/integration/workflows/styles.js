export const styleValues = {
  "white": "rgb(255, 255, 255)",
  "grey": "rgb(248, 248, 248)"
}

export const styleValueSelector = (styleValueSelector) => styleValues[styleValueSelector] || styleValueSelector;
