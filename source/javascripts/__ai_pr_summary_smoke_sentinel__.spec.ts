// DO NOT MERGE — sentinel spec for AI PR-comment summary smoke test.
// Drop this file together with the branch once the smoke test is done.

describe('AI PR comment summary smoke test sentinel', () => {
  it('fails on purpose to produce a failed PR build', () => {
    expect(true).toBe(false);
  });
});
