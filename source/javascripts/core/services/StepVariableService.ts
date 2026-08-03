import { EnvironmentItemModel, EnvModel } from '../models/BitriseYml';
import YmlUtils from '../utils/YmlUtils';

function group(inputs?: EnvModel): Record<string, EnvModel> {
  const groups: Record<string, EnvModel> = {};

  if (!inputs) {
    return groups;
  }

  inputs.forEach((input) => {
    const category = input.opts?.category ?? '';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(input);
  });

  return groups;
}

const getName = (input: EnvironmentItemModel) => {
  const { opts: _, ...rest } = input;
  return Object.keys(rest)[0];
};

/**
 * An input's value as editable text.
 *
 * An unquoted value that happens to look like a YAML flow collection — `notify_user_groups: {devs,qa}`
 * — parses to a map or array rather than a string, even though it was written as, and is consumed as,
 * plain text. Stringifying those back to their compact YAML form keeps the user's `{devs,qa}` legible
 * and editable; `String()` alone would render (and, once the field is edited, save) `[object Object]`.
 */
const getValue = (input: EnvironmentItemModel) => {
  const { opts: _, ...rest } = input;
  return YmlUtils.toInlineYml(Object.values(rest)[0]);
};

const findInput = (inputs: EnvModel, name: string) => {
  return inputs.find((input) => getName(input) === name);
};

export default {
  group,
  getName,
  getValue,
  findInput,
};
