describe("stringService", function() {

	var stringService;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_stringService_) {
		stringService = _stringService_;
	}));

	describe("stringReplacedWithParameters", function() {

		it("should replace parameters matched by key", function() {
			expect(stringService.stringReplacedWithParameters("red, <color>, blue", {
				color: "green"
			})).toBe("red, green, blue");
		});

		it("should skip not found keys", function() {
			expect(stringService.stringReplacedWithParameters("red, <color>, blue", {
				other_color: "green"
			})).toBe("red, <color>, blue");
		});

		it("should skip not defined keys", function() {
			expect(stringService.stringReplacedWithParameters("red, <color>, blue, <other_color>", {
				color: "green"
			})).toBe("red, green, blue, <other_color>");
		});

	});

	describe("isStringMatchingTerm", function() {

		it("should return true on exact match", function() {
			expect(stringService.isStringMatchingTerm("red", "red")).toBe(true);
			expect(stringService.isStringMatchingTerm("Green", "Green")).toBe(true);
		});

		it("should return true if string contains term", function() {
			expect(stringService.isStringMatchingTerm("redgreenblue", "red")).toBe(true);
			expect(stringService.isStringMatchingTerm("redgreenblue", "green")).toBe(true);
			expect(stringService.isStringMatchingTerm("redgreenblue", "blue")).toBe(true);
		});

		it("should return true even if only case insensitive match", function() {
			expect(stringService.isStringMatchingTerm("red", "Red")).toBe(true);
			expect(stringService.isStringMatchingTerm("Red", "red")).toBe(true);
			expect(stringService.isStringMatchingTerm("redgreenblue", "Red")).toBe(true);
			expect(stringService.isStringMatchingTerm("redGreenblue", "green")).toBe(true);
		});
		
	});

});
