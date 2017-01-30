describe("Workflow", function() {

	var Workflow;
	var bitriseSteplibService;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function(_Workflow_, _bitriseSteplibService_) {
		Workflow = _Workflow_;
		bitriseSteplibService = _bitriseSteplibService_;
		bitriseSteplibService.stepFromCVS = function(cvs) {
			if (!_.contains(["red-step", "green-step", "blue-step"], cvs)) {
				throw new Error("Step not found.");
			}
		}
	}));

	describe("create", function() {

		it("should allow custom keys in workflow config", function() {
			var workflow = new Workflow("red-workflow", {
				unknown_key: "unknown-value",
				envs: []
			});

			expect(workflow.workflowConfig.unknown_key).toBe("unknown-value");
		});

		it("should not change workflow ID if ID is passed in workflow config", function() {
			var workflow = new Workflow("red-workflow", {
				id: "blue-workflow",
				envs: []
			});

			expect(workflow.id).toBe("red-workflow");
		});

		it("should configure Workflow", function() {
			var workflow = new Workflow("red-workflow", {
				before_run: [
					"green-workflow",
					"blue-workflow"
				],
				after_run: [
					"blue-workflow"
				],
				envs: [{
					"RED-ENV-VAR": "RED-ENV-VAR-VALUE"
				}, {
					"GREEN-ENV-VAR": "GREEN-ENV-VAR-VALUE"
				}],
				steps: [{
					"red-step": {
						title: "Red step"
					}
				}]
			});

			expect(workflow.workflowConfig.envs.length).toBe(2);
			expect(workflow.workflowConfig.envs[0]["RED-ENV-VAR"]).toBe("RED-ENV-VAR-VALUE");
		});

	});

	describe("workflowChain", function() {

		var redWorkflow;
		var greenWorkflow;
		var blueWorkflow;
		beforeEach(function() {
			redWorkflow = new Workflow("red-workflow", {
				before_run: [],
				after_run: []
			});
			greenWorkflow = new Workflow("green-workflow", {
				before_run: [],
				after_run: []
			});
			blueWorkflow = new Workflow("blue-workflow", {
				before_run: [],
				after_run: []
			});
		});

		it("should include before and after workflows", function() {
			redWorkflow.workflowConfig.before_run.push(greenWorkflow.id);
			redWorkflow.workflowConfig.after_run.push(blueWorkflow.id);

			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow])).toContain(greenWorkflow);
			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow])).toContain(blueWorkflow);
		});

		it("should include before and after workflows recursively", function() {
			redWorkflow.workflowConfig.before_run.push(greenWorkflow.id);
			greenWorkflow.workflowConfig.before_run.push(blueWorkflow.id);

			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow])).toContain(blueWorkflow);

			yellowWorkflow = new Workflow("yellow-workflow", {
				before_run: [],
				after_run: []
			});
			blueWorkflow.workflowConfig.before_run.push(yellowWorkflow.id);

			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow, yellowWorkflow])).toContain(yellowWorkflow);
		});

		it("should not include all workflows", function() {
			redWorkflow.workflowConfig.after_run.push(blueWorkflow.id);

			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow])).not.toContain(greenWorkflow);
		});

	});

	describe("isLoopSafeRunForWorkflow", function() {

		var redWorkflow;
		var greenWorkflow;
		var blueWorkflow;
		beforeEach(function() {
			redWorkflow = new Workflow("red-workflow", {
				before_run: [],
				after_run: []
			});
			greenWorkflow = new Workflow("green-workflow", {
				before_run: [],
				after_run: []
			});
			blueWorkflow = new Workflow("blue-workflow", {
				before_run: [],
				after_run: []
			});
		});

		it("should return false if Workflow references self", function() {
			expect(redWorkflow.isLoopSafeRunForWorkflow(redWorkflow, [redWorkflow, greenWorkflow, blueWorkflow])).toBe(false);
			expect(greenWorkflow.isLoopSafeRunForWorkflow(greenWorkflow, [redWorkflow, greenWorkflow, blueWorkflow])).toBe(false);
			expect(blueWorkflow.isLoopSafeRunForWorkflow(blueWorkflow, [redWorkflow, greenWorkflow, blueWorkflow])).toBe(false);
		});

		it("should return false if Workflow references self through another Workflow", function() {
			redWorkflow.workflowConfig.after_run.push(greenWorkflow.id);

			expect(redWorkflow.isLoopSafeRunForWorkflow(greenWorkflow, [redWorkflow, greenWorkflow, blueWorkflow])).toBe(false);
		});

		it("should return false if Workflow references self through multiple Workflows", function() {
			redWorkflow.workflowConfig.after_run.push(blueWorkflow.id);
			blueWorkflow.workflowConfig.after_run.push(greenWorkflow.id);

			expect(redWorkflow.isLoopSafeRunForWorkflow(greenWorkflow, [redWorkflow, greenWorkflow, blueWorkflow])).toBe(false);
		});

		it("should return true if Workflow not references self", function() {
			redWorkflow.workflowConfig.after_run.push(greenWorkflow.id);
			greenWorkflow.workflowConfig.after_run.push(blueWorkflow.id);

			expect(blueWorkflow.isLoopSafeRunForWorkflow(redWorkflow, [redWorkflow, greenWorkflow, blueWorkflow])).toBe(true);
			expect(greenWorkflow.isLoopSafeRunForWorkflow(redWorkflow, [redWorkflow, greenWorkflow, blueWorkflow])).toBe(true);
			expect(blueWorkflow.isLoopSafeRunForWorkflow(greenWorkflow, [redWorkflow, greenWorkflow, blueWorkflow])).toBe(true);
		});
	});

});
