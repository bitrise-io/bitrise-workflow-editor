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
