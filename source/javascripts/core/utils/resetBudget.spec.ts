import { createResetBudget } from './resetBudget';

// Timestamps are passed explicitly so the window is exercised directly, with no timers involved.
describe('createResetBudget', () => {
  const budget = () => createResetBudget({ maxResets: 3, windowMs: 1000 });

  it('allows resets up to the limit inside one window', () => {
    const b = budget();

    expect([0, 2, 4].map((t) => b.tryConsume(t))).toEqual([true, true, true]);
  });

  it('stops once the limit is exceeded inside one window', () => {
    const b = budget();
    [0, 2, 4].forEach((t) => b.tryConsume(t));

    // A tight render loop: four resets within a few milliseconds.
    expect(b.tryConsume(6)).toBe(false);
  });

  it('does not accumulate across separate failures spaced under the window apart', () => {
    const b = budget();

    // Transient failures 900ms apart never reach three inside any one-second window, so the editor
    // must keep recovering rather than being blanked for good.
    const attempts = [0, 900, 1800, 2700, 3600, 4500, 5400, 6300].map((t) => b.tryConsume(t));

    expect(attempts).toEqual(attempts.map(() => true));
  });

  it('recovers after the window clears', () => {
    const b = budget();
    [0, 2, 4].forEach((t) => b.tryConsume(t));

    expect(b.tryConsume(6)).toBe(false);
    // Well past the window: the earlier burst no longer counts.
    expect(b.tryConsume(5000)).toBe(true);
  });

  it('counts only the resets still inside the window', () => {
    const b = budget();

    expect(b.tryConsume(0)).toBe(true);
    expect(b.tryConsume(400)).toBe(true);
    expect(b.tryConsume(800)).toBe(true);
    // 1200 drops the reset at 0, so this is the third in the window, not the fourth.
    expect(b.tryConsume(1200)).toBe(true);
    // 1300 keeps 400, 800 and 1200 — now four in the window.
    expect(b.tryConsume(1300)).toBe(false);
  });
});
