describe("Step", function() {

    var Step;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function(_Step_) {
        Step = _Step_;
    }));

    describe("validateStepConfig", function() {

        it("should not throw error", function() {
            expect(function() {
                Step.validateStepConfig({
                    title: "Red title",
                    description: "Red description"
                });
            }).not.toThrow();

            expect(function() {
                Step.validateStepConfig({
                    is_always_run: false,
                    is_requires_admin_user: true
                });
            }).not.toThrow();

            expect(function() {
                Step.validateStepConfig({
                    published_at: "2016-05-25T15:51:48.889904995+02:00"
                });
            }).not.toThrow();

            expect(function() {
                Step.validateStepConfig({
                    source: {
                        git: "red-git-url",
                        commit: "red-commit-hash"
                    }
                });
            }).not.toThrow();

            expect(function() {
                Step.validateStepConfig({
                    asset_urls: {
                        "icon.svg": "red-svg-url",
                        "icon.png": "red-png-url"
                    }
                });
            }).not.toThrow();

            expect(function() {
                Step.validateStepConfig({
                    type_tags: [
                        "type-a",
                        "type-b"
                    ]
                });
            }).not.toThrow();

            expect(function() {
                Step.validateStepConfig({
                    inputs: [{
                        KEY: "RED-VALUE",
                        opts: {
                            title: "Red input title"
                        }
                    }, {
                        KEY: "GREEN-VALUE"
                    }],
                    outputs: [{
                        KEY: "BLUE-VALUE"
                    }]
                });
            }).not.toThrow();
        });

        it("should throw error", function() {
            expect(function() {
                Step.validateStepConfig(null);
            }).toThrow();

            expect(function() {
                Step.validateStepConfig(undefined);
            }).toThrow();

            expect(function() {
                Step.validateStepConfig(true);
            }).toThrow();

            expect(function() {
                Step.validateStepConfig(1);
            }).toThrow();

            expect(function() {
                Step.validateStepConfig("invalid");
            }).toThrow();

            expect(function() {
                Step.validateStepConfig([1, 2]);
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    title: true
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    is_requires_admin_user: "invalid"
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    published_at: "invalid"
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    source: "invalid"
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    type_tags: "invalid"
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    type_tags: [
                        {
                            value: "invalid"
                        }
                    ]
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    source: {
                        git: {
                            value: "invalid"
                        }
                    }
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    source: {
                        git: "git-url"
                    }
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    source: {
                        git: "git-url",
                        unknown_key: "unknown_value"
                    }
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    source: {
                        git: "git-url",
                        commit: {
                            value: "invalid"
                        }
                    }
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    asset_urls: {
                        "icon.svg": {
                            value: "invalid"
                        }
                    }
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    inputs: [{
                        opts: {
                            title: "Missing key input"
                        }
                    }]
                });
            }).toThrow();

            expect(function() {
                Step.validateStepConfig({
                    outputs: [{
                        KEY: "VALUE"
                    }, {
                        opts: {
                            title: "Missing key input"
                        }
                    }]
                });
            }).toThrow();
        });

    });

    describe("createFromStepConfig", function() {

        it("should return step", function() {
            var step = Step.createFromStepConfig({
                title: "Red title"
            });

            expect(step).toEqual(jasmine.any(Step));
            expect(step.id).toBeUndefined();
            expect(step.title).toBe("Red title");
            expect(step.description).toBeUndefined();
            expect(step.stepConfigs.length).toBe(1);
        });

        it("should return step without ID and version", function() {
            var step = Step.createFromStepConfig({
                id: "red-step-id",
                version: "1.0",
                description: "Red step description"
            });

            expect(step.id).toBeUndefined();
            expect(step.version).toBeUndefined();
            expect(step.stepConfigs.length).toBe(1);
            expect(step.stepConfigs[0].id).toBe("red-step-id");
        });

    });

    describe("appendStepConfig", function() {

        var step;
        beforeEach(function() {
            step = Step.createFromStepConfig({
                title: "Red title",
                description: "Red step description",
                inputs: [{
                    red_input: "RED-VALUE",
                    opts: {
                        title: "Red input"
                    }
                }, {
                    blue_input: "BLUE-VALUE",
                    opts: {
                        title: "Blue input"
                    }
                }]
            });
        });

        it("should change overridden value, keep others", function() {
            step.appendStepConfig({
                title: "Blue title"
            });

            expect(step.title).toBe("Blue title");
            expect(step.description).toBe("Red step description");
            expect(step.inputs.length).toBe(2);
            expect(step.inputs[0].key).toBe("red_input");
        });

        it("should have step configs stacked", function() {
            step.appendStepConfig({
                title: "Green title"
            });

            step.appendStepConfig({
                title: "Blue title"
            });

            expect(step.stepConfigs.length).toBe(3);
            expect(step.stepConfigs[0].title).toBe("Red title");
            expect(step.stepConfigs[1].title).toBe("Green title");
            expect(step.stepConfigs[2].title).toBe("Blue title");
        });

        it("should overwrite specified inputs", function() {
            step.appendStepConfig({
                inputs: [{
                    red_input: "OTHER-RED-VALUE"
                }]
            });

            expect(step.inputs.length).toBe(2);
            expect(step.inputs[0].value).toBe("OTHER-RED-VALUE");
            expect(step.inputs[0].title).toBeUndefined();
            expect(step.inputs[1].value).toBe("BLUE-VALUE");
        });

        it("should insert not existing specified inputs", function() {
            step.appendStepConfig({
                inputs: [{
                    green_input: "GREEN-VALUE"
                }]
            });

            expect(step.inputs.length).toBe(3);
            expect(step.inputs[2].value).toBe("GREEN-VALUE");
        });

    });

});
