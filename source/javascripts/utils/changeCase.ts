import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';
import reduce from 'lodash/reduce';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';

type UnknownObject = { [s: string]: unknown };

const transformKeysDeep = (input: unknown, transformer: (key: string) => string): unknown => {
  if (isArray(input)) {
    return input.map((child) => transformKeysDeep(child, transformer));
  }

  if (isPlainObject(input)) {
    return reduce(
      input as UnknownObject,
      (result: UnknownObject, value: unknown, key: string) => ({
        ...result,
        [transformer(key)]: transformKeysDeep(value, transformer),
      }),
      {},
    );
  }

  return input;
};

export const camelCaseKeys = <T = unknown>(input: unknown): T => transformKeysDeep(input, camelCase) as T;
export const snakeCaseKeys = <T = unknown>(input: unknown): T => transformKeysDeep(input, snakeCase) as T;
