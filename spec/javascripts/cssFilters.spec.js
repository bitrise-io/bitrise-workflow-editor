describe("backgroundImagePropertyValue", function () {
	let $filter;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function (_$filter_) {
		$filter = _$filter_;
	}));

	it("should return image URL wrapped to be compatible with background-image css property", function () {
		expect($filter("backgroundImagePropertyValue")("image-url")).toBe("url('image-url')");
	});
});
