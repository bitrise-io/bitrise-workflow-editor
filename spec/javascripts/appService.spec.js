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

	describe("handleSecretAfterSave", () => {
		let Variable;

		beforeEach(inject(function (_Variable_) {
			Variable = _Variable_;
		}));

		it("should set value to null if secret is protected", () => {
			const secret = new Variable(
				{
					"TEST_KEY": "test value"
				}
			);
			secret.isProtected(true);

			appService.handleSecretAfterSave(secret);

			expect(secret.isKeyChangeable).toBeFalsy();
			expect(secret.shouldShowValue).toBeFalsy();
			expect(secret.value()).toBeNull();
		});

		it("should leave the value untouched if secret is not protected", () => {
			const testValue = "test value";
			const secret = new Variable(
				{
					"TEST_KEY": testValue
				}
			);
			secret.isProtected(false);

			appService.handleSecretAfterSave(secret);

			expect(secret.isKeyChangeable).toBeFalsy();
			expect(secret.shouldShowValue).toBeFalsy();
			expect(secret.value()).toEqual(testValue);
		});
	});
});
