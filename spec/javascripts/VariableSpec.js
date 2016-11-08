describe("Variable", function() {

    var Variable;

    beforeEach(module("BitriseWorkflowEditor"));
    beforeEach(inject(function (_Variable_) {
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

        it("should throw error (and not update variable) if variable config is invalid", function() {
            var variable;

            expect(function() {
                variable = Variable.createFromVariableConfig({
                    opts: {
                        title: "No key",
                    }
                });
            }).toThrow();
            expect(variable).toBeUndefined();
        });

    });

});