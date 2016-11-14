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
        })

    });

});
