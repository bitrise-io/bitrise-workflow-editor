describe("Trigger", function() {

	let Trigger;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_Trigger_) {
		Trigger = _Trigger_;
	}));

	describe("type", function() {

		it("should return push if push branch pattern is set", function() {
			const trigger = new Trigger({
				"push_branch": "red"
			});

			expect(trigger.type()).toBe("push");
		});

		it("should return pull request if pull request branch pattern is set", function() {
			const trigger = new Trigger({
				"pull_request_source_branch": "red",
				"pull_request_target_branch": "green"
			});

			expect(trigger.type()).toBe("pull-request");
		});

		it("should return tag if tag pattern is set", function() {
			const trigger = new Trigger({
				tag: "red"
			});

			expect(trigger.type()).toBe("tag");
		});

		it("should set empty pattern to corresponding type, undefined for other patterns", function() {
			const trigger = new Trigger();

			expect(trigger.type("pull-request")).toBe("pull-request");
			expect(trigger.triggerConfig.push_branch).toBeUndefined();
			expect(trigger.triggerConfig.pull_request_source_branch).toBe("");
			expect(trigger.triggerConfig.pull_request_target_branch).toBe("");
			expect(trigger.triggerConfig.tag).toBeUndefined();
		});

	});

	describe("setTarget", function() {
		it("should set a workflow type target", function() {
			const trigger = new Trigger();

			trigger.setTarget({ type: "workflow", value: "red-workflow" });
			
			expect(trigger.triggerConfig.workflow).toBe("red-workflow");
			expect(trigger.triggerConfig.pipeline).not.toBeDefined();
		})

		it("should set a pipeline type target", function() {
			const trigger = new Trigger();

			trigger.setTarget({ type: "pipeline", value: "blue-pipeline" });
			
			expect(trigger.triggerConfig.workflow).not.toBeDefined();
			expect(trigger.triggerConfig.pipeline).toBe("blue-pipeline");
		})
	})

	describe("getTarget", function() {
		it("should return a workflow type target", function() {
			const trigger = new Trigger({
				workflow: "red-workflow"
			});

			const target = trigger.getTarget();
			expect(target.type).toBe("workflow");
			expect(target.value).toBe("red-workflow");
		})

		it("should return a pipeline type target", function() {
			const trigger = new Trigger({
				pipeline: "blue-pipeline"
			});

			const target = trigger.getTarget();
			expect(target.type).toBe("pipeline");
			expect(target.value).toBe("blue-pipeline");
		})
	})

	describe("pushBranchPattern", function() {

		it("should get undefined if trigger is of other type", function() {
			const trigger = new Trigger({
				tag: "red"
			});

			expect(trigger.pushBranchPattern()).toBeUndefined();
		});

		it("should get push branch pattern of trigger", function() {
			const trigger = new Trigger({
				"push_branch": "red"
			});

			expect(trigger.pushBranchPattern()).toBe("red");
		});

		it("should set push branch pattern to trigger", function() {
			const trigger = new Trigger();

			expect(trigger.pushBranchPattern("red")).toBe("red");
			expect(trigger.triggerConfig.push_branch).toBe("red");
		});

		it("should set type to push", function() {
			const trigger = new Trigger({
				tag: "red"
			});
			trigger.pushBranchPattern("red");

			expect(trigger.type()).toBe("push");
		});

	});

	describe("pullRequestSourceBranchPattern", function() {

		it("should get undefined if trigger is of other type", function() {
			const trigger = new Trigger({
				tag: "red"
			});

			expect(trigger.pullRequestSourceBranchPattern()).toBeUndefined();
		});

		it("should get pull request source branch pattern of trigger", function() {
			const trigger = new Trigger({
				"pull_request_source_branch": "red"
			});

			expect(trigger.pullRequestSourceBranchPattern()).toBe("red");
		});

		it("should set pull request source branch pattern to trigger", function() {
			const trigger = new Trigger();

			expect(trigger.pullRequestSourceBranchPattern("red")).toBe("red");
			expect(trigger.triggerConfig.pull_request_source_branch).toBe("red");
		});

		it("should set type to pull request", function() {
			const trigger = new Trigger({
				tag: "red"
			});
			trigger.pullRequestSourceBranchPattern("red");

			expect(trigger.type()).toBe("pull-request");
		});

	});

	describe("pullRequestTargetBranchPattern", function() {

		it("should get undefined if trigger is of other type", function() {
			const trigger = new Trigger({
				tag: "red"
			});

			expect(trigger.pullRequestTargetBranchPattern()).toBeUndefined();
		});

		it("should get pull request target branch pattern of trigger", function() {
			const trigger = new Trigger({
				"pull_request_target_branch": "red"
			});

			expect(trigger.pullRequestTargetBranchPattern()).toBe("red");
		});

		it("should set pull request target branch pattern to trigger", function() {
			const trigger = new Trigger();

			expect(trigger.pullRequestTargetBranchPattern("red")).toBe("red");
			expect(trigger.triggerConfig.pull_request_target_branch).toBe("red");
		});

		it("should set type to pull request", function() {
			const trigger = new Trigger({
				tag: "red"
			});
			trigger.pullRequestTargetBranchPattern("red");

			expect(trigger.type()).toBe("pull-request");
		});

	});

	describe("tagPattern", function() {

		it("should get undefined if trigger is of other type", function() {
			const trigger = new Trigger({
				"push_branch": "red"
			});

			expect(trigger.tagPattern()).toBeUndefined();
		});

		it("should get tag pattern of trigger", function() {
			const trigger = new Trigger({
				tag: "red"
			});

			expect(trigger.tagPattern()).toBe("red");
		});

		it("should set tag pattern to trigger", function() {
			const trigger = new Trigger();

			expect(trigger.tagPattern("red")).toBe("red");
			expect(trigger.triggerConfig.tag).toBe("red");
		});

		it("should set type to tag", function() {
			const trigger = new Trigger({
				"push_branch": "red"
			});
			trigger.tagPattern("red");

			expect(trigger.type()).toBe("tag");
		});

	});

});

describe("displayNameForTriggerType", function() {

	let $filter;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function (_$filter_) {
		$filter = _$filter_;
	}));

	it("should return trigger type display name", function() {
		expect($filter("displayNameForTriggerType")("push")).toBe("Push");
		expect($filter("displayNameForTriggerType")("pull-request")).toBe("Pull request");
		expect($filter("displayNameForTriggerType")("tag")).toBe("Tag");
	});

});
