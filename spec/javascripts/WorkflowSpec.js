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

});
