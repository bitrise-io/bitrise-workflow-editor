// eslint-disable-next-line import/no-extraneous-dependencies
import { MatcherFunction } from 'expect';

import { BitriseYml } from '@/core/models/BitriseYml';

import { yaml as yamlHelper } from './yaml-helper';

(global as any).yaml = yamlHelper;

const toMatchBitriseYml: MatcherFunction<[expected: BitriseYml]> = function m(actual, expected) {
  const objectsAreEquals = this.equals(actual, expected, undefined, true);

  if (!objectsAreEquals) {
    return {
      pass: false,
      message: () => this.utils.printDiffOrStringify(expected, actual, 'Expected', 'Received', false),
    };
  }

  const actualString = JSON.stringify(actual, null, 2);
  const expectedString = JSON.stringify(expected, null, 2);
  const stringsAreEquals = this.equals(actualString, expectedString);

  if (!stringsAreEquals) {
    return {
      pass: false,
      message: () => this.utils.printDiffOrStringify(expectedString, actualString, 'Expected', 'Received', false),
    };
  }

  return {
    pass: true,
    message: () => this.utils.printDiffOrStringify(expected, actual, 'Expected', 'Received', false),
  };
};

expect.extend({
  toMatchBitriseYml,
});
