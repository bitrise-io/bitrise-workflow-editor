describe("Workflow", function () {
	let Workflow;
	let stepSourceService;

	beforeEach(module("BitriseWorkflowEditor"));
	beforeEach(inject(function (_Workflow_, _stepSourceService_) {
		Workflow = _Workflow_;
		stepSourceService = _stepSourceService_;
		const originalStepFromCVS = stepSourceService.stepFromCVS;
		stepSourceService.stepFromCVS = function (cvs) {
			if (!_.contains(["red-step", "green-step", "blue-step"], cvs)) {
				throw new Error("Step not found.");
			}

			return originalStepFromCVS(cvs);
		};
	}));

	describe("create", function () {
		it("should allow custom keys in workflow config", function () {
			const workflow = new Workflow("red-workflow", {
				unknown_key: "unknown-value",
				envs: [],
			});

			expect(workflow.workflowConfig.unknown_key).toBe("unknown-value");
		});

		it("should not change workflow ID if ID is passed in workflow config", function () {
			const workflow = new Workflow("red-workflow", {
				id: "blue-workflow",
				envs: [],
			});

			expect(workflow.id).toBe("red-workflow");
		});

		it("should configure Workflow", function () {
			const workflow = new Workflow("red-workflow", {
				before_run: ["green-workflow", "blue-workflow"],
				after_run: ["blue-workflow"],
				envs: [
					{
						"RED-ENV-VAR": "RED-ENV-VAR-VALUE",
					},
					{
						"GREEN-ENV-VAR": "GREEN-ENV-VAR-VALUE",
					},
				],
				steps: [
					{
						"red-step": {
							title: "Red step",
						},
					},
				],
			});

			expect(workflow.workflowConfig.envs.length).toBe(2);
			expect(workflow.workflowConfig.envs[0]["RED-ENV-VAR"]).toBe("RED-ENV-VAR-VALUE");
		});
	});

	describe("isValidID", function () {
		it("should return undefined if id is not defined", function () {
			expect(Workflow.isValidID(undefined)).toBeUndefined();
		});

		it("should return false if ID is empty", function () {
			expect(Workflow.isValidID("")).toBeFalsy();
		});

		it("should return false if ID contains something other than numbers, letters, dash, dot, or underscore", function () {
			expect(Workflow.isValidID("ABC?123")).toBeFalsy();
			expect(Workflow.isValidID("ABC!123")).toBeFalsy();
			expect(Workflow.isValidID("ABC<>123")).toBeFalsy();
		});

		it("should return true", function () {
			expect(Workflow.isValidID("ABC1def")).toBeTruthy();
			expect(Workflow.isValidID("abc1DEF")).toBeTruthy();
			expect(Workflow.isValidID("ABC_DEF")).toBeTruthy();
			expect(Workflow.isValidID("ABC-DEF")).toBeTruthy();
			expect(Workflow.isValidID("ABC.DEF")).toBeTruthy();
			expect(Workflow.isValidID("_ABC_DEF_")).toBeTruthy();
		});
	});

	describe("workflowChain", function () {
		let redWorkflow;
		let greenWorkflow;
		let blueWorkflow;
		beforeEach(function () {
			redWorkflow = new Workflow("red-workflow", {
				before_run: [],
				after_run: [],
			});
			greenWorkflow = new Workflow("green-workflow", {
				before_run: [],
				after_run: [],
			});
			blueWorkflow = new Workflow("blue-workflow", {
				before_run: [],
				after_run: [],
			});
		});

		it("should include before and after workflows", function () {
			redWorkflow.workflowConfig.before_run.push(greenWorkflow.id);
			redWorkflow.workflowConfig.after_run.push(blueWorkflow.id);

			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow])).toContain(greenWorkflow);
			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow])).toContain(blueWorkflow);
		});

		it("should include before and after workflows recursively", function () {
			redWorkflow.workflowConfig.before_run.push(greenWorkflow.id);
			greenWorkflow.workflowConfig.before_run.push(blueWorkflow.id);

			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow])).toContain(blueWorkflow);

			const yellowWorkflow = new Workflow("yellow-workflow", {
				before_run: [],
				after_run: [],
			});

			blueWorkflow.workflowConfig.before_run.push(yellowWorkflow.id);

			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow, yellowWorkflow])).toContain(
				yellowWorkflow,
			);
		});

		it("should not include all workflows", function () {
			redWorkflow.workflowConfig.after_run.push(blueWorkflow.id);

			expect(redWorkflow.workflowChain([redWorkflow, greenWorkflow, blueWorkflow])).not.toContain(greenWorkflow);
		});
	});
});
