describe("stringService", function () {
	let stringService;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function (_stringService_) {
		stringService = _stringService_;
	}));

	describe("stringReplacedWithParameters", function () {
		it("should replace parameters matched by key", function () {
			expect(
				stringService.stringReplacedWithParameters("red, <color>, blue", {
					color: "green",
				}),
			).toBe("red, green, blue");
		});

		it("should skip not found keys", function () {
			expect(
				stringService.stringReplacedWithParameters("red, <color>, blue", {
					other_color: "green",
				}),
			).toBe("red, <color>, blue");
		});

		it("should skip not defined keys", function () {
			expect(
				stringService.stringReplacedWithParameters("red, <color>, blue, <other_color>", {
					color: "green",
				}),
			).toBe("red, green, blue, <other_color>");
		});
	});

	describe("joinedString", function () {
		it("should return strings joined with joiner character", function () {
			expect(stringService.joinedString(["a", "b", "c"], ".")).toBe("a.b.c");
			expect(stringService.joinedString(["a", "b", "c"], "-")).toBe("a-b-c");
		});

		it("should return strings joined without joiner character if not specified", function () {
			expect(stringService.joinedString(["a", "b", "c"])).toBe("abc");
			expect(stringService.joinedString(["a", "b", "c"])).toBe("abc");
		});

		it("should return strings joined with joiner character, leave space after it if specified", function () {
			expect(stringService.joinedString(["a", "b", "c"], ".", true)).toBe("a. b. c");
			expect(stringService.joinedString(["a", "b", "c"], "-", true)).toBe("a- b- c");
		});

		it("should return strings joined with joiner character, leave space if joiner character is comma", function () {
			expect(stringService.joinedString(["a", "b", "c"], ",")).toBe("a, b, c");
		});

		it("should return strings joined with joiner character, omit space if specified", function () {
			expect(stringService.joinedString(["a", "b", "c"], ",", false)).toBe("a,b,c");
		});
	});

	describe("isStringMatchingTerm", function () {
		it("should return true on exact match", function () {
			expect(stringService.isStringMatchingTerm("red", "red")).toBe(true);
			expect(stringService.isStringMatchingTerm("Green", "Green")).toBe(true);
		});

		it("should return true if string contains term", function () {
			expect(stringService.isStringMatchingTerm("redgreenblue", "red")).toBe(true);
			expect(stringService.isStringMatchingTerm("redgreenblue", "green")).toBe(true);
			expect(stringService.isStringMatchingTerm("redgreenblue", "blue")).toBe(true);
		});

		it("should return true even if only case insensitive match", function () {
			expect(stringService.isStringMatchingTerm("red", "Red")).toBe(true);
			expect(stringService.isStringMatchingTerm("Red", "red")).toBe(true);
			expect(stringService.isStringMatchingTerm("redgreenblue", "Red")).toBe(true);
			expect(stringService.isStringMatchingTerm("redGreenblue", "green")).toBe(true);
		});
	});

	describe("errorMessageFromErrors", function () {
		it("should return a comma-separated, capitalized sentence", function () {
			const errors = [new Error("some error"), new Error("another error"), new Error("last error")];
			expect(stringService.errorMessageFromErrors(errors)).toBe("Some error, another error, last error.");
		});
	});
});
