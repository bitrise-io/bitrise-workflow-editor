import { StepApiResult } from '@/core/api/StepApi';

import { compareByPriority } from './StepSelectorDrawer.utils';

describe('compareByPriority', () => {
  it('should return 0 when both steps are official steps', () => {
    const stepA = {
      resolvedInfo: { isOfficial: true },
    } as StepApiResult;
    const stepB = {
      resolvedInfo: { isOfficial: true },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(0);
    expect(compareByPriority(stepB, stepA)).toBe(0);
  });

  it('should prioritize official steps over verified steps', () => {
    const stepA = { resolvedInfo: { isOfficial: true } } as StepApiResult;
    const stepB = {
      resolvedInfo: {
        isVerified: true,
      },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(-1);
    expect(compareByPriority(stepB, stepA)).toBe(1);
  });

  it('should prioritize official steps over community steps', () => {
    const stepA = { resolvedInfo: { isOfficial: true } } as StepApiResult;
    const stepB = {
      resolvedInfo: {
        isCommunity: true,
      },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(-1);
    expect(compareByPriority(stepB, stepA)).toBe(1);
  });

  it('should prioritize official steps over non-prioritized steps', () => {
    const stepA = { resolvedInfo: { isOfficial: true } } as StepApiResult;
    const stepB = {
      resolvedInfo: {
        isOfficial: false,
        isVerified: false,
        isCommunity: false,
      },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(-1);
    expect(compareByPriority(stepB, stepA)).toBe(1);
  });

  it('should return 0 when both steps are verified steps', () => {
    const stepA = {
      resolvedInfo: { isVerified: true },
    } as StepApiResult;
    const stepB = {
      resolvedInfo: { isVerified: true },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(0);
    expect(compareByPriority(stepB, stepA)).toBe(0);
  });

  it('should prioritize verified steps over community steps', () => {
    const stepA = {
      resolvedInfo: { isVerified: true },
    } as StepApiResult;
    const stepB = {
      resolvedInfo: { isCommunity: true },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(-1);
    expect(compareByPriority(stepB, stepA)).toBe(1);
  });

  it('should prioritize verified steps over non-prioritized steps', () => {
    const stepA = {
      resolvedInfo: { isVerified: true },
    } as StepApiResult;
    const stepB = {
      resolvedInfo: {
        isOfficial: false,
        isVerified: false,
        isCommunity: false,
      },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(-1);
    expect(compareByPriority(stepB, stepA)).toBe(1);
  });

  it('should return 0 when both steps are community steps', () => {
    const stepA = {
      resolvedInfo: { isCommunity: true },
    } as StepApiResult;
    const stepB = {
      resolvedInfo: { isCommunity: true },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(0);
    expect(compareByPriority(stepB, stepA)).toBe(0);
  });

  it('should prioritize community steps over non-prioritize steps', () => {
    const stepA = {
      resolvedInfo: { isCommunity: true },
    } as StepApiResult;
    const stepB = {
      resolvedInfo: {
        isOfficial: false,
        isVerified: false,
        isCommunity: false,
      },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(-1);
    expect(compareByPriority(stepB, stepA)).toBe(1);
  });

  it('should return 0 when both steps are non-prioritized steps', () => {
    const stepA = {
      resolvedInfo: {
        isCommunity: false,
        isOfficial: false,
        isVerified: false,
      },
    } as StepApiResult;
    const stepB = {
      resolvedInfo: {
        isCommunity: false,
        isOfficial: false,
        isVerified: false,
      },
    } as StepApiResult;
    expect(compareByPriority(stepA, stepB)).toBe(0);
    expect(compareByPriority(stepB, stepA)).toBe(0);
  });
});
