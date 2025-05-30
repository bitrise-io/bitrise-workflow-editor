export function yaml(strings: TemplateStringsArray, ...values: any[]) {
  const result = String.raw({ raw: strings }, ...values);
  const match = result.match(/^[ \t]*(?=\S)/gm);

  if (!match) return result;

  const indent = Math.min(...match.map((x) => x.length));
  const pattern = new RegExp(`^[ \\t]{${indent}}`, 'gm');

  return `${result.replace(pattern, '').trim()}\n`;
}
