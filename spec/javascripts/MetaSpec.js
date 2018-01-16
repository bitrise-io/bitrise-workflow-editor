describe("Meta", function() {

	var Meta;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_Meta_) {
		Meta = _Meta_;
	}));

	describe("valueGetterSetter", function() {

		describe("getter mode", function() {

			it("should return value for key in bundle from default config if user defined config is empty", function() {
				var meta = new Meta({}, {
					bundle: {
						key: "value"
					}
				});
				expect(meta.valueGetterSetter(undefined, "key", "bundle")).toBe("value");
			});

			it("should return value for key in bundle from default config if user defined config has no such bundle", function() {
				var meta = new Meta({
					bundle1: {
						key: "value1"
					}
				}, {
					bundle2: {
						key: "value2"
					}
				});
				expect(meta.valueGetterSetter(undefined, "key", "bundle2")).toBe("value2");
			});

			it("should return value for key in bundle from default config if user defined config has no such key in bundle", function() {
				var meta = new Meta({
					bundle: {
						key1: "value1"
					}
				}, {
					bundle: {
						key2: "value2"
					}
				});
				expect(meta.valueGetterSetter(undefined, "key2", "bundle")).toBe("value2");
			});

			it("should return value for key in bundle from user defined config if it is defined there", function() {
				var meta = new Meta({
					bundle: {
						key: "value"
					}
				});
				expect(meta.valueGetterSetter(undefined, "key", "bundle")).toBe("value");
			});

			it("should return value for key in bundle from user defined config if it is defined there, even if it is also defined in the default config", function() {
				var meta = new Meta({
					bundle: {
						key: "value1"
					}
				}, {
					bundle: {
						key: "value2"
					}
				});
				expect(meta.valueGetterSetter(undefined, "key", "bundle")).toBe("value1");
			});

			it("should return null for key in bundle if no configs", function() {
				var meta = new Meta({}, {});
				expect(meta.valueGetterSetter(undefined, "key", "bundle")).toBeNull();
			});

			it("should return null for key in bundle if bundle is not defined in any of the configs", function() {
				var meta = new Meta({
					bundle1: {
						key: "value"
					}
				}, {
					bundle2: {
						key: "value"
					}
				});
				expect(meta.valueGetterSetter(undefined, "key", "bundle3")).toBeNull();
			});

			it("should return null for key in bundle if key is not defined in the bundle in any of the configs", function() {
				var meta = new Meta({
					bundle: {
						key1: "value"
					}
				}, {
					bundle: {
						key2: "value"
					}
				});
				expect(meta.valueGetterSetter(undefined, "key3", "bundle")).toBeNull();
			});

			it("should return null for key in bundle if key and bundle are defined, but not with each other", function() {
				var meta = new Meta({
					bundle1: {
						key1: "value1"
					}
				}, {
					bundle2: {
						key2: "value2"
					}
				});
				expect(meta.valueGetterSetter(undefined, "key1", "bundle2")).toBeNull();
			});
		});

		describe("setter mode", function() {

			it("should set value for key in bundle in the user defined config", function() {
				var meta = new Meta({});
				meta.valueGetterSetter("value", "key", "bundle");
				expect(meta.userMetaConfig).toEqual({
					bundle: {
						key: "value"
					}
				});
				expect(meta.defaultMetaConfig).toBeUndefined();
			});

			it("should set value for key in bundle in the user defined config, leave other bundles untouched", function() {
				var meta = new Meta({
					bundle1: {
						key1: "value1"
					}
				});
				meta.valueGetterSetter("value2", "key2", "bundle2");
				expect(meta.userMetaConfig).toEqual({
					bundle1: {
						key1: "value1"
					},
					bundle2: {
						key2: "value2"
					}
				});
				expect(meta.defaultMetaConfig).toBeUndefined();
			});

			it("should set value for key in bundle in the user defined config, leave default config untouched", function() {
				var meta = new Meta({
					bundle: {
						key: "value1"
					}
				}, {
					bundle: {
						key: "value2"
					}
				});
				meta.valueGetterSetter("value3", "key", "bundle");
				expect(meta.userMetaConfig).toEqual({
					bundle: {
						key: "value3"
					}
				});
				expect(meta.defaultMetaConfig).toEqual({
					bundle: {
						key: "value2"
					}
				});
			});

			it("should clear value for key in bundle in the user defined config, if it is set to null", function() {
				var meta = new Meta({
					bundle: {
						key1: "value1",
						key2: "value2"
					}
				});
				meta.valueGetterSetter(null, "key1", "bundle");
				expect(meta.userMetaConfig).toEqual({
					bundle: {
						key2: "value2"
					}
				});
				expect(meta.defaultMetaConfig).toBeUndefined();
			});

			it("should clear bundle in the user defined config if it becomes empty by setting its only key's value to null", function() {
				var meta = new Meta({
					bundle: {
						key: "value"
					}
				});
				meta.valueGetterSetter(null, "key", "bundle");
				expect(meta.userMetaConfig).toEqual({});
				expect(meta.defaultMetaConfig).toBeUndefined();
			});

			it("should clear value for key in bundle in the user defined config, if it becomes the same as in the default config", function() {
				var meta = new Meta({
					bundle: {
						key1: "value1",
						key2: "value2"
					}
				}, {
					bundle: {
						key1: "value3"
					}
				});
				meta.valueGetterSetter("value3", "key1", "bundle");
				expect(meta.userMetaConfig).toEqual({
					bundle: {
						key2: "value2"
					}
				}, {
					bundle: {
						key1: "value3"
					}
				});
				expect(meta.defaultMetaConfig).toEqual({
					bundle: {
						key1: "value3"
					}
				})
			});

			it("should clear bundle in the user defined config, if it becomes the same (all keys) as in the default config", function() {
				var meta = new Meta({
					bundle1: {
						key1: "value1"
					},
					bundle2: {
						key2: "value2"
					}
				}, {
					bundle1: {
						key1: "value3"
					},
					bundle2: {
						key2: "value4"
					}
				});
				meta.valueGetterSetter("value3", "key1", "bundle1");
				expect(meta.userMetaConfig).toEqual({
					bundle2: {
						key2: "value2"
					}
				});
				expect(meta.defaultMetaConfig).toEqual({
					bundle1: {
						key1: "value3"
					},
					bundle2: {
						key2: "value4"
					}
				});
			});
		});

	});

});
