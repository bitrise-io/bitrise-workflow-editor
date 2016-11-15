describe("Trigger", function() {

    var Trigger;
    var Workflow;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function(_Trigger_, _Workflow_) {
        Trigger = _Trigger_;
        Workflow = _Workflow_;
    }));

    var workflows;
    beforeEach(function() {
        workflows = [
            new Workflow("red-workflow"),
            new Workflow("green-workflow"),
            new Workflow("blue-workflow")
        ];
    });

    describe("validateTriggerConfig", function() {

        it("should not throw error", function() {
            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    push_branch: "red-branch"
                }, workflows);
            }).not.toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    pull_request_source_branch: "red-branch",
                    pull_request_target_branch: "blue-branch"
                }, workflows);
            }).not.toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    tag: "red-tag"
                }, workflows);
            }).not.toThrow();
        });

        it("should throw error", function() {
            expect(function() {
                Trigger.validateTriggerConfig(null, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig(undefined, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig(true, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig(1, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig("invalid", workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig([1, 2], workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({}, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "yellow-workflow",
                    push_branch: "red-branch"
                }, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow"
                }, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    unknown_key: "unknown_value"
                }, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    push_branch: 1
                }, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    tag: true
                }, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    pull_request_source_branch: "red-branch",
                    pull_request_target_branch: 2
                }, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    pull_request_source_branch: "red-branch"
                }, workflows);
            }).toThrow();

            expect(function() {
                Trigger.validateTriggerConfig({
                    workflow: "red-workflow",
                    pull_request_target_branch: "red-branch"
                }, workflows);
            }).toThrow();
        });

    });

    describe("createFromTriggerConfig", function() {

        it("should return push trigger", function() {
            var trigger = Trigger.createFromTriggerConfig({
                workflow: "red-workflow",
                push_branch: "red-branch"
            }, workflows);

            expect(trigger).toEqual(jasmine.any(Trigger));
            expect(trigger.type).toBe("push");
            expect(trigger.pushBranchPattern).toBe("red-branch");
            expect(trigger.pullRequestSourceBranchPattern).toBeUndefined();
            expect(trigger.pullRequestTargetBranchPattern).toBeUndefined();
            expect(trigger.tagPattern).toBeUndefined();
            expect(trigger.workflow).toBe(workflows[0]);
        });

        it("should return pull-request trigger", function() {
            var trigger = Trigger.createFromTriggerConfig({
                workflow: "red-workflow",
                pull_request_source_branch: "red-branch",
                pull_request_target_branch: "green-branch"
            }, workflows);

            expect(trigger.type).toBe("pull-request");
            expect(trigger.pushBranchPattern).toBeUndefined();
            expect(trigger.pullRequestSourceBranchPattern).toBe("red-branch");
            expect(trigger.pullRequestTargetBranchPattern).toBe("green-branch");
            expect(trigger.tagPattern).toBeUndefined();
        });

        it("should return tag trigger", function() {
            var trigger = Trigger.createFromTriggerConfig({
                workflow: "red-workflow",
                tag: "red-tag"
            }, workflows);

            expect(trigger.type).toBe("tag");
            expect(trigger.pushBranchPattern).toBeUndefined();
            expect(trigger.pullRequestSourceBranchPattern).toBeUndefined();
            expect(trigger.pullRequestTargetBranchPattern).toBeUndefined();
            expect(trigger.tagPattern).toBe("red-tag");
        });

    });

});

describe("displayNameForTriggerType", function() {

    var $filter;
    var Trigger;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function (_$filter_, _Trigger_) {
        $filter = _$filter_;
        Trigger = _Trigger_;
    }));

    it("should return trigger type display name", function() {
        expect($filter("displayNameForTriggerType")("push")).toBe("Push");
        expect($filter("displayNameForTriggerType")("pull-request")).toBe("PR");
        expect($filter("displayNameForTriggerType")("tag")).toBe("Tag");
    });

});
