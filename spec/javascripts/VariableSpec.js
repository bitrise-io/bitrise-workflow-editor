describe("Variable", function() {

    var Variable;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function(_Variable_) {
        Variable = _Variable_;
    }));

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

        it("should change overridden option, keep others", function() {
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

    describe("strippedVariableConfig", function() {

        var variable;
        var defaultVariableConfig = {
            KEY: "RED-VALUE",
            opts: {
                title: "Red title",
                summary: "Red summary",
                description: "Red variable description",
                is_expand: true,
                is_required: true
            }
        };
        var strippedVariableConfig;

        it("should keep value", function() {
            variable = Variable.createFromVariableConfig({
                KEY: "GREEN-VALUE"
            });

            expect(variable.strippedVariableConfig(defaultVariableConfig).KEY).toBe("GREEN-VALUE");
        });

        it("should keep value, even if it matches default value", function() {
            variable = Variable.createFromVariableConfig({
                KEY: "RED-VALUE"
            });

            expect(variable.strippedVariableConfig(defaultVariableConfig).KEY).toBe("RED-VALUE");
        });

        it("should strip options which matches the default value", function() {
            variable = Variable.createFromVariableConfig({
                KEY: "RED-VALUE",
                opts: {
                    title: "Red title"
                }
            });

            expect(variable.strippedVariableConfig(defaultVariableConfig).opts.title).toBeUndefined();
        });

        it("should keep options which differs from the default value", function() {
            variable = Variable.createFromVariableConfig({
                KEY: "RED-VALUE",
                opts: {
                    title: "Green title"
                }
            });

            expect(variable.strippedVariableConfig(defaultVariableConfig).opts.title).toBe("Green title");
        });

        it("should keep options not found in default config", function() {
            variable = Variable.createFromVariableConfig({
                KEY: "GREEN-VALUE",
                opts: {
                    unknown_opt: "unknown-opt-value"
                }
            });

            strippedVariableConfig = variable.strippedVariableConfig(defaultVariableConfig);

            expect(strippedVariableConfig.opts.unknown_opt).not.toBeUndefined();
            expect(strippedVariableConfig.opts.unknown_opt).toBe("unknown-opt-value");
        });

        it("should keep & strip based on sum of appended configs and UI edit when comparing", function() {
            variable = Variable.createFromVariableConfig({
                KEY: "GREEN-VALUE",
                opts: {
                    title: "Green title",
                    is_expand: false,
                    is_required: true
                }
            });

            variable.appendVariableConfig({
                KEY: "BLUE-VALUE",
                opts: {
                    is_expand: true,
                    is_required: false
                }
            });

            variable.description = "Green variable description";

            strippedVariableConfig = variable.strippedVariableConfig(defaultVariableConfig);

            expect(strippedVariableConfig.KEY).toBe("BLUE-VALUE");
            expect(strippedVariableConfig.opts.title).toBe("Green title");
            expect(strippedVariableConfig.opts.is_expand).toBeUndefined();
            expect(strippedVariableConfig.opts.is_required).not.toBeUndefined();
            expect(strippedVariableConfig.opts.is_required).toBe(false);
            expect(strippedVariableConfig.opts.description).not.toBeUndefined();
            expect(strippedVariableConfig.opts.description).toBe("Green variable description");
        });

    });

});

describe("prettifiedVariableKey", function() {

    var $filter;
    var Variable;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function (_$filter_, _Variable_) {
        $filter = _$filter_;
        Variable = _Variable_;
    }));

    it("should return undefined", function() {
        expect($filter("prettifiedVariableKey")(undefined)).toBeUndefined();
        expect($filter("prettifiedVariableKey")(new Variable())).toBeUndefined();
    });

    it("should return prettified variable key", function() {
        expect($filter("prettifiedVariableKey")(new Variable("RED-KEY"))).toBe("$RED-KEY");
    });

});
