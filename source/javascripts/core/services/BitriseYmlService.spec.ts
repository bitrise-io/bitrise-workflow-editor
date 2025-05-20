import { BitriseYml } from '../models/BitriseYml';

describe('BitriseYmlService', () => {
  it('should', () => {
    expect(true).toBe(true);
  });
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toMatchBitriseYml(expected: BitriseYml): void;
  }

  interface Matchers<R> {
    toMatchBitriseYml(expected: BitriseYml): R;
  }
}
