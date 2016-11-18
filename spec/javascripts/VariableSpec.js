describe("Variable", function() {

	var Variable;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_Variable_) {
		Variable = _Variable_;
	}));

	describe("keyFromVariableConfig", function() {

		it("should return key", function() {
			expect(Variable.keyFromVariableConfig({
				KEY: "RED-VALUE"
			})).toBe("KEY");
			expect(Variable.keyFromVariableConfig({
				KEY: "RED-VALUE",
				opts: {
					title: "Red title"
				}
			})).toBe("KEY");
		});

	});

});

describe("prettifiedVariableKey", function() {

	var $filter;
	var Variable;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function (_$filter_, _Variable_) {
		$filter = _$filter_;
		Variable = _Variable_;
	}));

	it("should return undefined", function() {
		expect($filter("prettifiedVariableKey")(undefined)).toBeUndefined();
		expect($filter("prettifiedVariableKey")(new Variable())).toBeUndefined();
	});

	it("should return prettified variable key", function() {
		var variable = new Variable({
			"RED-KEY": "RED-VALUE"
		});

		expect($filter("prettifiedVariableKey")(variable)).toBe("$RED-KEY");
	});

});
