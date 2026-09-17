import { isBrowserExtensionError, parallelWorkflowSourceId, searchParamsFromLocation } from './CommonUtils';

describe('parallelWorkflowSourceId', () => {
  it('strips the generated parallel-workflow suffix', () => {
    expect(parallelWorkflowSourceId('sharded-tests_13')).toBe('sharded-tests');
    expect(parallelWorkflowSourceId('build_0')).toBe('build');
  });

  it('strips only the trailing suffix, keeping an id that legitimately ends in `_<n>`', () => {
    expect(parallelWorkflowSourceId('build_2_3')).toBe('build_2');
  });

  it('returns undefined when the id carries no such suffix', () => {
    expect(parallelWorkflowSourceId('build')).toBeUndefined();
    expect(parallelWorkflowSourceId('build_')).toBeUndefined();
    expect(parallelWorkflowSourceId('build_v2')).toBeUndefined();
  });
});

describe('searchParamsFromLocation', () => {
  it('reads the params of a hash location', () => {
    expect(searchParamsFromLocation('#!/workflows?workflow_id=deploy&tab=configuration')).toEqual({
      workflow_id: 'deploy',
      tab: 'configuration',
    });
  });

  it('takes the last value of a duplicated param', () => {
    expect(searchParamsFromLocation('#!/workflows?workflow_id=first&workflow_id=last')).toEqual({
      workflow_id: 'last',
    });
  });

  it('returns an empty object when there is no query string', () => {
    expect(searchParamsFromLocation('#!/workflows')).toEqual({});
    expect(searchParamsFromLocation('')).toEqual({});
  });
});

describe('isBrowserExtensionError', () => {
  it('matches the shapes the window listeners and the RUM SDK hand us', () => {
    // ErrorEvent: the path is on the event itself
    expect(isBrowserExtensionError({ filename: 'chrome-extension://abc/content.js', message: 'boom' })).toBe(true);
    // ErrorEvent: the path is only in the wrapped Error's stack
    expect(isBrowserExtensionError({ error: { stack: 'at f (moz-extension://abc/x.js:1:1)' } })).toBe(true);
    // A bare Error, as `unhandledrejection` gives us via `e.reason`
    expect(isBrowserExtensionError({ stack: 'at g (chrome-extension://abc/x.js:1:1)' })).toBe(true);
    // Legacy Safari and EdgeHTML schemes, which the app still sees from older extensions
    expect(isBrowserExtensionError({ stack: 'at h (safari-extension://abc/x.js:1:1)' })).toBe(true);
    expect(isBrowserExtensionError({ stack: 'at i (ms-browser-extension://abc/x.js:1:1)' })).toBe(true);
  });

  it('leaves our own errors alone', () => {
    expect(isBrowserExtensionError({ stack: 'at save (https://app.bitrise.io/wfe.js:1:1)' })).toBe(false);
    expect(isBrowserExtensionError(undefined)).toBe(false);
    // "extension" on its own is not an extension URL
    expect(isBrowserExtensionError({ message: 'unknown file extension: .yml' })).toBe(false);
  });
});
