describe("AppService", () => {
  let appService;

	beforeEach(() => {
    module("BitriseWorkflowEditor");
    inject((_appServiceUtil_) => {
      appService = _appServiceUtil_;
    });
  });

  const runWithUrl = (url, fn) => {
    with({ document: { location: { href: url } }}) fn;
  };

  describe("getAppSlug", () => {
    it("should return app slug from the path", () => {
      const testSlug = "testId01"

      runWithUrl(`https://app.bitrise.io/app/${testSlug}/workflow_editor#!/workflows?workflow_id=primary`, () => {
        expect(appService.getAppSlug()).toEqual(testSlug);
      });
    });

    it("should return null if url not in expected format", () => {
      const testSlug = "testId01"

      runWithUrl(`https://app.bitrise.io/test${testSlug}/something`, () => {
        expect(appService.getAppSlug()).toBeNull();
      });
    });
  });
});
