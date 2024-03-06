describe("AppService", () => {
	let appService;

	beforeEach(() => {
		module("BitriseWorkflowEditor");
		inject((_appServiceUtil_) => {
			appService = _appServiceUtil_;
		});
	});

	const runWithUrl = (url, fn) => {
		// eslint-disable-next-line no-with
		with ({ document: { location: { href: url } } }) fn;
	};

	describe("getAppSlug", () => {
		it("should return app slug from the path if it is in hex format", () => {
			runWithUrl("https://app.bitrise.io/app/abcdefgh12345678/workflow_editor#!/workflows?workflow_id=primary", () => {
				expect(appService.getAppSlug()).toEqual("abcdefgh12345678");
			});
		});

		it("should return app slug from the path if it is in UUID format", () => {
			runWithUrl(
				"https://app.bitrise.io/app/abcd1234-ef56-7890-ab12-cd34567890ab/workflow_editor#!/workflows?workflow_id=primary",
				() => {
					expect(appService.getAppSlug()).toEqual("abcd1234-ef56-7890-ab12-cd34567890ab");
				},
			);
		});

		it("should return null if url not in expected format", () => {
			runWithUrl("https://app.bitrise.io/zzzzzzzz12345678/something", () => {
				expect(appService.getAppSlug()).toBeNull();
			});

			runWithUrl(
				"https://app.bitrise.io/app/zzzzzzzz-ef56-7890-ab12-cd34567890ab/workflow_editor#!/workflows?workflow_id=primary",
				() => {
					expect(appService.getAppSlug()).toBeNull();
				},
			);

			runWithUrl("https://app.bitrise.io/testabcdefgh12345678/something", () => {
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
			const secret = new Variable({
				TEST_KEY: "test value",
			});
			secret.isProtected(true);

			appService.handleSecretAfterSave(secret);

			expect(secret.isKeyChangeable).toBeFalsy();
			expect(secret.shouldShowValue).toBeFalsy();
			expect(secret.value()).toBeNull();
		});

		it("should leave the value untouched if secret is not protected", () => {
			const testValue = "test value";
			const secret = new Variable({
				TEST_KEY: testValue,
			});
			secret.isProtected(false);

			appService.handleSecretAfterSave(secret);

			expect(secret.isKeyChangeable).toBeFalsy();
			expect(secret.shouldShowValue).toBeFalsy();
			expect(secret.value()).toEqual(testValue);
		});
	});
});
