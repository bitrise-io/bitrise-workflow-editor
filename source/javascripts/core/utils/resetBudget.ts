type ResetBudgetOptions = {
  /** How many resets are allowed inside `windowMs`. */
  maxResets: number;
  /** Width of the rolling window, in milliseconds. */
  windowMs: number;
};

/**
 * Rate limiter for automatically resetting the root error boundary.
 *
 * A deterministic render error re-throws the moment the boundary is reset, so resetting
 * unconditionally spins into an unbounded render loop that re-reports the same error every
 * iteration. Giving up after a burst of resets stops that.
 *
 * The budget counts resets inside a rolling window rather than measuring the gap between
 * consecutive ones. Measuring the gap conflates two different things: a genuine loop (resets
 * microseconds apart) and an unlucky chain of separate transient failures that each land just inside
 * the window. The latter would keep incrementing a gap-based counter forever and eventually blank
 * the editor for good, at a rate the budget was never meant to reject.
 */
function createResetBudget({ maxResets, windowMs }: ResetBudgetOptions) {
  let recentResets: number[] = [];

  return {
    /** Records a reset at `now` and reports whether it still fits in the budget. */
    tryConsume(now: number = Date.now()) {
      recentResets = recentResets.filter((at) => now - at < windowMs);
      recentResets.push(now);

      return recentResets.length <= maxResets;
    },
  };
}

export { createResetBudget };
