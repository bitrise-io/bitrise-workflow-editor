describe("Variable", function() {

    var Variable;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function (_Variable_) {
        Variable = _Variable_;
    }));

    describe("validateVariableConfig", function() {

        it("should not throw error", function() {
            expect(function() {
                Variable.validateVariableConfig({
                    KEY: "RED-VALUE"
                });
            }).not.toThrow();

            expect(function() {
                Variable.validateVariableConfig({
                    KEY: 3
                });
            }).not.toThrow();

            expect(function() {
                Variable.validateVariableConfig({
                    KEY: {
                        red_key: "RED-VALUE",
                        blue_key: "BLUE-VALUE"
                    }
                });
            }).not.toThrow();

            expect(function() {
                Variable.validateVariableConfig({
                    KEY: "RED-VALUE",
                    opts: {
                        title: "Red title",
                        description: "Red variable description",
                        is_expand: false,
                        value_options: [
                            "option-a",
                            "option-b"
                        ]
                    }
                });
            }).not.toThrow();
        });

        it("should throw error", function() {
            expect(function() {
                Variable.validateVariableConfig(null)
            }).toThrow();
            expect(function() {
                Variable.validateVariableConfig(undefined)
            }).toThrow();
            expect(function() {
                Variable.validateVariableConfig(true)
            }).toThrow();
            expect(function() {
                Variable.validateVariableConfig(1)
            }).toThrow();
            expect(function() {
                Variable.validateVariableConfig("invalid")
            }).toThrow();
            expect(function() {
                Variable.validateVariableConfig([1, 2])
            }).toThrow();

            expect(function() {
                Variable.validateVariableConfig({})
            }).toThrow();
            expect(function() {
                Variable.validateVariableConfig({
                    opts: {
                        title: "Red title"
                    }
                });
            }).toThrow();
            expect(function() {
                Variable.validateVariableConfig({
                    KEY: "RED-VALUE",
                    OTHER_KEY: "OTHER-RED-VALUE",
                    opts: {
                        title: "Red title"
                    }
                });
            }).toThrow();

            expect(function() {
                Variable.validateVariableConfig({
                    KEY: null
                });
            }).toThrow();

            expect(function() {
                Variable.validateVariableConfig({
                    KEY: "RED-VALUE",
                    opts: {
                        title: true
                    }
                });
            }).toThrow();

            expect(function() {
                Variable.validateVariableConfig({
                    KEY: "RED-VALUE",
                    opts: {
                        is_expand: "VALUE"
                    }
                });
            }).toThrow();

            expect(function() {
                Variable.validateVariableConfig({
                    KEY: "RED-VALUE",
                    opts: {
                        value_options: "VALUE"
                    }
                });
            }).toThrow();
        });

    });

    describe("createFromVariableConfig", function() {

        it("should return variable with only key and value set", function() {
            var variable = Variable.createFromVariableConfig({
                KEY: "RED-VALUE"
            });

            expect(variable).toEqual(jasmine.any(Variable));
            expect(variable.key).toBe("KEY");
            expect(variable.value).toBe("RED-VALUE");
            expect(variable.title).toBeUndefined();
            expect(variable.variableConfigs.length).toBe(1);
        });

        it("should return variable with opts set", function() {
            var variable = Variable.createFromVariableConfig({
                KEY: "RED-VALUE",
                opts: {
                    title: "Red title",
                    description: "Red variable description"
                }
            });

            expect(variable.title).toBe("Red title");
            expect(variable.description).toBe("Red variable description");
        });

    });

    describe("appendVariableConfig", function() {

        var variable;
        beforeEach(function() {
            variable = Variable.createFromVariableConfig({
                KEY: "RED-VALUE",
                opts: {
                    title: "Red title",
                    description: "Red variable description"
                }
            });
        });

        it("should change value", function() {
            variable.appendVariableConfig({
                KEY: "NEW-RED-VALUE"
            });

            expect(variable.key).toBe("KEY");
            expect(variable.value).toBe("NEW-RED-VALUE");
        });

        it("should change overridden option, keep otherwise", function() {
            variable.appendVariableConfig({
                KEY: "VALUE",
                opts: {
                    title: "New red title"
                }
            });

            expect(variable.title).toBe("New red title");
            expect(variable.description).toBe("Red variable description");
        });

        it("should have variable configs stacked", function() {
            variable.appendVariableConfig({
                KEY: "NEW-RED-VALUE"
            });

            variable.appendVariableConfig({
                KEY: "OTHER-NEW-RED-VALUE"
            });

            expect(variable.variableConfigs.length).toBe(3);
            expect(variable.variableConfigs[0].KEY).toBe("RED-VALUE");
            expect(variable.variableConfigs[1].KEY).toBe("NEW-RED-VALUE");
            expect(variable.variableConfigs[2].KEY).toBe("OTHER-NEW-RED-VALUE");
        });

        it("should throw error (and not update variable) if main keys mismatch", function() {
            expect(function() {
                variable.appendVariableConfig({
                    NEW_KEY: "VALUE"
                });
            }).toThrow();
        });

    });

    describe("keyFromVariableConfig", function() {

        it("should return key", function() {
            expect(Variable.keyFromVariableConfig({
                KEY: "RED-VALUE"
            })).toBe("KEY");
            expect(Variable.keyFromVariableConfig({
                KEY: "RED-VALUE",
                opts: {
                    title: "Red title"
                }
            })).toBe("KEY");
        });

    });

});