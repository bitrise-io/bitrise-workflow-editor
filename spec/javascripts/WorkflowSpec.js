describe("Workflow", function() {

    var Workflow;
    var bitriseSteplibService;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function(_Workflow_, _bitriseSteplibService_) {
        Workflow = _Workflow_;
        bitriseSteplibService = _bitriseSteplibService_;
        bitriseSteplibService.stepFromCVS = function(cvs) {
            if (!_.contains(["red-step", "green-step", "blue-step"], cvs)) {
                throw new Error("<%= data[:strings][:bitrise_steplib_service][:step_from_cvs][:id_not_found] %>");
            }
        }
    }));

    describe("validateWorkflowConfig", function() {

        it("should not throw error", function() {
            expect(function() {
                Workflow.validateWorkflowConfig({
                    before_run: [
                        "green-workflow"
                    ],
                    after_run: [
                        "green-workflow",
                        "blue-workflow"
                    ],
                    envs: [{
                        "red-env-var": "RED-ENV-VAR-VALUE",
                        opts: {
                            title: "Red Env Var"
                        }
                    }, {
                        "green-env-var": "GREEN-ENV-VAR-VALUE",
                        opts: {
                            title: "Green Env Var"
                        }
                    }],
                    steps: [{
                        "red-step": {
                            title: "Red step"
                        }
                    }, {
                        "green-step": {
                            title: "Green step"
                        }
                    }, {
                        "blue-step": {
                            title: "Blue step"
                        }
                    }]
                });
            }).not.toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    before_run: [
                        "green-workflow"
                    ]
                });
            }).not.toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    steps: [{
                        "red-step": {
                            title: "Red step"
                        }
                    }]
                });
            }).not.toThrow();
        });

        it("should throw error", function() {
            expect(function() {
                Workflow.validateWorkflowConfig(null);
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig(undefined);
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig(true);
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig(1);
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig("invalid");
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig([1, 2]);
            }).toThrow();
        });

        it("should throw error for invalid before_run/after_run", function() {
            expect(function() {
                Workflow.validateWorkflowConfig({
                    before_run: "invalid"
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    before_run: [
                        {}
                    ]
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    after_run: "invalid"
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    after_run: [
                        {}
                    ]
                });
            }).toThrow();
        });

        it("should throw error for invalid envs", function() {
            expect(function() {
                Workflow.validateWorkflowConfig({
                    envs: "invalid"
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    envs: [
                        {}
                    ]
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    envs: [
                        {
                            opts: {
                                title: "Red env var"
                            }
                        }
                    ]
                });
            }).toThrow();
        });

        it("should throw error for invalid steps", function() {
            expect(function() {
                Workflow.validateWorkflowConfig({
                    steps: "invalid"
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    steps: [
                        {}
                    ]
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    steps: [
                        {
                            "yellow-step": {
                                title: "Red env var"
                            }
                        }
                    ]
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    steps: [
                        {
                            "red-step": "invalid"
                        }
                    ]
                });
            }).toThrow();

            expect(function() {
                Workflow.validateWorkflowConfig({
                    steps: [
                        {
                            "red-step": {
                                title: true
                            }
                        }
                    ]
                });
            }).toThrow();
        });

    });

    describe("configureWithWorkflowConfig", function() {

        it("should allow custom keys", function() {
            var workflow = new Workflow("red-workflow");
            workflow.configureWithWorkflowConfig({
                unknown_key: "unknown-value",
                envs: []
            });
        });

        it("should not change workflow ID", function() {
            var workflow = new Workflow("red-workflow");
            workflow.configureWithWorkflowConfig({
                id: "blue-workflow",
                envs: []
            });
        });

        it("should configure Workflow", function() {
            var workflow = new Workflow("red-workflow");
            workflow.configureWithWorkflowConfig({
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

            expect(workflow.envVars.length).toBe(2);
            expect(workflow.envVars[0].key).toBe("RED-ENV-VAR");
        });

        it("should not add before & after run Workflows, just return with callback", function() {
            var workflow = new Workflow("red-workflow");
            var callback = workflow.configureWithWorkflowConfig({
                before_run: [
                    "green-workflow",
                    "blue-workflow"
                ],
                after_run: [
                    "blue-workflow"
                ]
            });

            expect(workflow.beforeRunWorkflows).toBeUndefined();
            expect(workflow.afterRunWorkflows).toBeUndefined();
            expect(typeof callback).toBe("function");
        });

    });

    describe("isLoopSafeRunForWorkflow", function() {

        var redWorkflow;
        var greenWorkflow;
        var blueWorkflow;
        beforeEach(function() {
            redWorkflow = new Workflow("red-workflow");
            redWorkflow.beforeRunWorkflows = [];
            redWorkflow.afterRunWorkflows = [];
            greenWorkflow = new Workflow("green-workflow");
            greenWorkflow.beforeRunWorkflows = [];
            greenWorkflow.afterRunWorkflows = [];
            blueWorkflow = new Workflow("blue-workflow");
            blueWorkflow.beforeRunWorkflows = [];
            blueWorkflow.afterRunWorkflows = [];
        });

        it("should return false if Workflow references self", function() {
            expect(redWorkflow.isLoopSafeRunForWorkflow(redWorkflow)).toBe(false);
            expect(greenWorkflow.isLoopSafeRunForWorkflow(greenWorkflow)).toBe(false);
            expect(blueWorkflow.isLoopSafeRunForWorkflow(blueWorkflow)).toBe(false);
        });

        it("should return false if Workflow references self through another Workflow", function() {
            redWorkflow.afterRunWorkflows.push(greenWorkflow);

            expect(redWorkflow.isLoopSafeRunForWorkflow(greenWorkflow)).toBe(false);
        });

        it("should return false if Workflow references self through multiple Workflows", function() {
            redWorkflow.afterRunWorkflows.push(blueWorkflow);
            blueWorkflow.afterRunWorkflows.push(greenWorkflow);

            expect(redWorkflow.isLoopSafeRunForWorkflow(greenWorkflow)).toBe(false);
        });

        it("should return true if Workflow not references self", function() {
            redWorkflow.afterRunWorkflows.push(greenWorkflow);
            greenWorkflow.afterRunWorkflows.push(blueWorkflow);

            expect(blueWorkflow.isLoopSafeRunForWorkflow(redWorkflow)).toBe(true);
            expect(greenWorkflow.isLoopSafeRunForWorkflow(redWorkflow)).toBe(true);
            expect(blueWorkflow.isLoopSafeRunForWorkflow(greenWorkflow)).toBe(true);
        });
    });

});
