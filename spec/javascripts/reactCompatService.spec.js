describe("ReactCompatService", () => {
	let reactCompatService;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject((_reactCompatService_) => {
		reactCompatService = _reactCompatService_;
	}));

	describe("cachedFn", () => {
		it("should return same reference when underlying object is the same", () => {
			const mockFn = reactCompatService.cachedFn(() => [1, 3, 4, 5]);

			const first = mockFn();
			const second = mockFn();

			expect(first).toBe(second);
		});

		it("should return different reference when underlying object changed", () => {
			let i = 0;
			const mockFn = reactCompatService.cachedFn(() => [1, 3, 4, 5, ++i]);

			const first = mockFn();
			const second = mockFn();

			expect(first).not.toBe(second);
		});
	});
});
