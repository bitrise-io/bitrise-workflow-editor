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

});
