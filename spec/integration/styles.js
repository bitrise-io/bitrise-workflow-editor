export const styleValues = {
  "white": "rgb(255, 255, 255)",
  "grey": "rgb(248, 248, 248)",
  "purple": "rgb(129, 81, 168)"
}

export const styleValueSelector = (styleValueSelector) => styleValues[styleValueSelector] || styleValueSelector;
