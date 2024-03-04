describe("Meta", () => {
	let Meta;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function (_Meta_) {
		Meta = _Meta_;
	}));

	describe("valueGetterSetter", () => {
		describe("getter mode", () => {
			it("should return value for key in bundle from default config if user defined config is empty", () => {
				const meta = new Meta(
					{},
					{
						bundle: {
							key: "value",
						},
					},
				);
				expect(meta.valueGetterSetter("bundle", "key", undefined)).toBe("value");
			});

			it("should return value for key in bundle from default config if user defined config has no such bundle", () => {
				const meta = new Meta(
					{
						bundle1: {
							key: "value1",
						},
					},
					{
						bundle2: {
							key: "value2",
						},
					},
				);
				expect(meta.valueGetterSetter("bundle2", "key", undefined)).toBe("value2");
			});

			it("should return value for key from default config if user defined config has no such key", () => {
				const meta = new Meta(
					{
						bundle: {
							key1: "value1",
						},
					},
					{
						bundle: {
							key2: "value2",
						},
					},
				);
				expect(meta.valueGetterSetter("bundle", "key2", undefined)).toBe("value2");
			});

			it("should return value for key in bundle from user defined config if it is defined there", () => {
				const meta = new Meta({
					bundle: {
						key: "value",
					},
				});
				expect(meta.valueGetterSetter("bundle", "key", undefined)).toBe("value");
			});

			it(
				"should return value for key in bundle from user defined configthere," +
					"even if it is also defined in the default config",
				() => {
					const meta = new Meta(
						{
							bundle: {
								key: "value1",
							},
						},
						{
							bundle: {
								key: "value2",
							},
						},
					);
					expect(meta.valueGetterSetter("bundle", "key", undefined)).toBe("value1");
				},
			);

			it("should return null for key in bundle if no configs", () => {
				const meta = new Meta({}, {});
				expect(meta.valueGetterSetter("bundle", "key", undefined)).toBeNull();
			});

			it("should return null for key in bundle if bundle is not defined in any of the configs", () => {
				const meta = new Meta(
					{
						bundle1: {
							key: "value",
						},
					},
					{
						bundle2: {
							key: "value",
						},
					},
				);
				expect(meta.valueGetterSetter("bundle3", "key", undefined)).toBeNull();
			});

			it("should return null for key in bundle if key is not defined in the bundle in any of the configs", () => {
				const meta = new Meta(
					{
						bundle: {
							key1: "value",
						},
					},
					{
						bundle: {
							key2: "value",
						},
					},
				);
				expect(meta.valueGetterSetter("bundle", "key3", undefined)).toBeNull();
			});

			it("should return null for key in bundle if key and bundle are defined, but not with each other", () => {
				const meta = new Meta(
					{
						bundle1: {
							key1: "value1",
						},
					},
					{
						bundle2: {
							key2: "value2",
						},
					},
				);
				expect(meta.valueGetterSetter("bundle2", "key1", undefined)).toBeNull();
			});
		});

		describe("setter mode", () => {
			it("should set value for key in bundle in the user defined config", () => {
				const meta = new Meta({});
				meta.valueGetterSetter("bundle", "key", "value");
				expect(meta.userMetaConfig).toEqual({
					bundle: {
						key: "value",
					},
				});
				expect(meta.defaultMetaConfig).toBeUndefined();
			});

			it("should set value for key in bundle in the user defined config, leave other bundles untouched", () => {
				const meta = new Meta({
					bundle1: {
						key1: "value1",
					},
				});
				meta.valueGetterSetter("bundle2", "key2", "value2");
				expect(meta.userMetaConfig).toEqual({
					bundle1: {
						key1: "value1",
					},
					bundle2: {
						key2: "value2",
					},
				});
				expect(meta.defaultMetaConfig).toBeUndefined();
			});

			it("should set value for key in bundle in the user defined config, leave default config untouched", () => {
				const meta = new Meta(
					{
						bundle: {
							key: "value1",
						},
					},
					{
						bundle: {
							key: "value2",
						},
					},
				);
				meta.valueGetterSetter("bundle", "key", "value3");
				expect(meta.userMetaConfig).toEqual({
					bundle: {
						key: "value3",
					},
				});
				expect(meta.defaultMetaConfig).toEqual({
					bundle: {
						key: "value2",
					},
				});
			});

			it("should clear value for key in bundle in the user defined config, if it is set to null", () => {
				const meta = new Meta({
					bundle: {
						key1: "value1",
						key2: "value2",
					},
				});
				meta.valueGetterSetter("bundle", "key1", null);
				expect(meta.userMetaConfig).toEqual({
					bundle: {
						key2: "value2",
					},
				});
				expect(meta.defaultMetaConfig).toBeUndefined();
			});

			it(`should clear bundle in the user defined config
			if it becomes empty by setting its only key's value to null`, () => {
				const meta = new Meta({
					bundle: {
						key: "value",
					},
				});
				meta.valueGetterSetter("bundle", "key", null);
				expect(meta.userMetaConfig).toEqual({});
				expect(meta.defaultMetaConfig).toBeUndefined();
			});

			it(`should clear value for key in bundle in the user defined config,
			if it becomes the same as in the default config`, () => {
				const meta = new Meta(
					{
						bundle: {
							key1: "value1",
							key2: "value2",
						},
					},
					{
						bundle: {
							key1: "value3",
						},
					},
				);
				meta.valueGetterSetter("bundle", "key1", "value3");
				expect(meta.userMetaConfig).toEqual(
					{
						bundle: {
							key2: "value2",
						},
					},
					{
						bundle: {
							key1: "value3",
						},
					},
				);
				expect(meta.defaultMetaConfig).toEqual({
					bundle: {
						key1: "value3",
					},
				});
			});

			it(`should clear bundle in the user defined config,
					if it becomes the same (all keys) as in the default config`, () => {
				const meta = new Meta(
					{
						bundle1: {
							key1: "value1",
						},
						bundle2: {
							key2: "value2",
						},
					},
					{
						bundle1: {
							key1: "value3",
						},
						bundle2: {
							key2: "value4",
						},
					},
				);
				meta.valueGetterSetter("bundle1", "key1", "value3");
				expect(meta.userMetaConfig).toEqual({
					bundle2: {
						key2: "value2",
					},
				});
				expect(meta.defaultMetaConfig).toEqual({
					bundle1: {
						key1: "value3",
					},
					bundle2: {
						key2: "value4",
					},
				});
			});
		});
	});
});
