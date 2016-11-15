describe("Trigger", function() {

    var Trigger;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function(_Trigger_) {
        Trigger = _Trigger_;
    }));

    describe("validateTriggerConfig", function() {

        it("should not throw error", function() {
            expect(function() {
                Trigger.validateTriggerConfig({
                    push_branch: "red-branch"
                });
            }).not.toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    pull_request_source_branch: "red-branch",
                    pull_request_target_branch: "blue-branch"
                });
            }).not.toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    tag: "red-tag"
                });
            }).not.toThrow();
        });

        it("should throw error", function() {
            expect(function() {
                Trigger.validateTriggerConfig(null);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig(undefined);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig(true);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig(1);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig("invalid");
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig([1, 2]);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({})
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    unknown_key: "unknown_value"
                });
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    push_branch: 1
                });
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    tag: true
                });
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    pull_request_source_branch: "red-branch",
                    pull_request_target_branch: 2
                });
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    pull_request_source_branch: "red-branch"
                });
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    pull_request_target_branch: "red-branch"
                });
            }).toThrow();
        });

    });

});
