describe("Variable", function () {
  let Variable;

  beforeEach(module("BitriseWorkflowEditor"));
  beforeEach(inject(function (_Variable_) {
    Variable = _Variable_;
  }));

  describe("key", function () {
    it("should return user defined key if is defined", function () {
      const variable = new Variable(
        {
          blue_key: "blue_variable",
        },
        {
          red_key: "red_variable",
        },
      );

      expect(variable.key()).toBe("blue_key");
    });

    it("should return default if no user variable config is defined", function () {
      const variable = new Variable(undefined, {
        red_key: "red_variable",
      });

      expect(variable.key()).toBe("red_key");
    });

    it(`should return undefined if no user variable config is defined
		and default variable config has no key defined`, () => {
      const variable = new Variable(undefined, {
        opts: {
          title: "Red title",
        },
      });

      expect(variable.key()).toBeUndefined();
    });

    it("should change key", function () {
      const variable = new Variable(undefined, {
        red_key: "red_variable",
      });

      expect(variable.key("blue_key")).toBe("blue_key");
      expect(variable.userVariableConfig.blue_key).toBe("red_variable");
    });

    it("should delete old key from user variable config if it was defined", function () {
      const variable = new Variable(undefined, {
        red_key: "red_variable",
      });

      variable.key("green_key");
      variable.key("blue_key");

      expect(variable.userVariableConfig.blue_key).toBe("red_variable");
      expect(variable.userVariableConfig.green_key).toBeUndefined();
    });

    it("should keep key in user variable config if it is the default and options are defined", function () {
      const variable = new Variable(
        {
          new_red_key: "red_variable",
          opts: {
            title: "New red title",
          },
        },
        {
          red_key: "red_variable",
          opts: {
            title: "Red title",
          },
        },
      );

      expect(variable.key("red_key")).toBe("red_key");
      expect(variable.userVariableConfig).not.toBeUndefined();
      expect(variable.userVariableConfig.red_key).toBe("red_variable");
    });

    it("should keep user variable config even if key is the default and options are not defined", function () {
      const variable = new Variable(
        {
          new_red_key: "red_variable",
        },
        {
          red_key: "red_variable",
        },
      );

      expect(variable.key("red_key")).toBe("red_key");
      expect(variable.userVariableConfig).not.toBeUndefined();
      expect(variable.userVariableConfig.red_key).toBe("red_variable");
    });
  });

  describe("isValidKey", function () {
    it("should return undefined if key is not defined", function () {
      expect(Variable.isValidKey(undefined)).toBeUndefined();
    });

    it("should return false if key is empty", function () {
      expect(Variable.isValidKey("")).toBeFalsy();
    });

    it("should return false if key starts with number", function () {
      expect(Variable.isValidKey("1")).toBeFalsy();
      expect(Variable.isValidKey("1ABC")).toBeFalsy();
    });

    it("should return true if key contains number, but does not start with it", function () {
      expect(Variable.isValidKey("ABC1")).toBeTruthy();
      expect(Variable.isValidKey("AB1C")).toBeTruthy();
    });

    it("should return false if key contains something other than numbers, letters, or underscore", function () {
      expect(Variable.isValidKey("ABC-123")).toBeFalsy();
      expect(Variable.isValidKey("ABC?123")).toBeFalsy();
      expect(Variable.isValidKey("ABC.123")).toBeFalsy();
      expect(Variable.isValidKey("ABC-123")).toBeFalsy();
    });

    it("should return true even if key contains small letters, or underscore", function () {
      expect(Variable.isValidKey("ABC1def")).toBeTruthy();
      expect(Variable.isValidKey("abc1DEF")).toBeTruthy();
      expect(Variable.isValidKey("ABC_DEF")).toBeTruthy();
      expect(Variable.isValidKey("_ABC_DEF_")).toBeTruthy();
    });
  });

  describe("value", function () {
    it("should return user defined value if is defined", function () {
      const variable = new Variable(
        {
          blue_key: "blue_variable",
        },
        {
          red_key: "red_variable",
        },
      );

      expect(variable.value()).toBe("blue_variable");
    });

    it("should return default if no user variable config is defined", function () {
      const variable = new Variable(undefined, {
        red_key: "red_variable",
      });

      expect(variable.value()).toBe("red_variable");
    });

    it("should change value", function () {
      const variable = new Variable(
        {
          red_key: "green_variable",
        },
        {
          red_key: "red_variable",
        },
      );

      expect(variable.value("blue_variable")).toBe("blue_variable");
      expect(variable.userVariableConfig.red_key).toBe("blue_variable");
    });

    it("should create user variable config if not defined", function () {
      const variable = new Variable(undefined, {
        red_key: "red_variable",
      });

      expect(variable.value("blue_variable")).toBe("blue_variable");
      expect(variable.userVariableConfig).not.toBeUndefined();
    });

    it("should keep value in user variable config if it is the default and options are defined", function () {
      const variable = new Variable(
        {
          red_key: "new_red_variable",
          opts: {
            title: "New red title",
          },
        },
        {
          red_key: "red_variable",
          opts: {
            title: "Red title",
          },
        },
      );

      expect(variable.value("red_variable")).toBe("red_variable");
      expect(variable.userVariableConfig).not.toBeUndefined();
      expect(variable.userVariableConfig.red_key).toBe("red_variable");
    });

    it("should keep user variable config even if value is the default and options are not defined", function () {
      const variable = new Variable(
        {
          red_key: "new_red_variable",
        },
        {
          red_key: "red_variable",
        },
      );

      expect(variable.value("red_variable")).toBe("red_variable");
      expect(variable.userVariableConfig).not.toBeUndefined();
      expect(variable.userVariableConfig.red_key).toBe("red_variable");
    });
  });

  describe("title", function () {
    const defaultVariableConfig = {
      key: "value",
      opts: {
        title: "Red title",
      },
    };

    it("should get title from user variable config", function () {
      const variable = new Variable(
        {
          key: "value",
          opts: {
            title: "Blue title",
          },
        },
        defaultVariableConfig,
      );

      expect(variable.title()).toBe("Blue title");
    });

    it("should get title from default variable config if user variable config is not defined", function () {
      const variable = new Variable(undefined, defaultVariableConfig);

      expect(variable.title()).toBe("Red title");
    });

    it("should get title from default variable config if user variable config opts is not defined", function () {
      const variable = new Variable(
        {
          key: "new-value",
        },
        defaultVariableConfig,
      );

      expect(variable.title()).toBe("Red title");
    });

    it("should get title from default variable config if is not defined in user variable config", function () {
      const variable = new Variable(
        {
          key: "value",
          opts: {
            title: "Blue title",
          },
        },
        defaultVariableConfig,
      );

      expect(variable.title()).toBe("Blue title");
    });

    it("should override title", function () {
      const variable = new Variable(
        {
          key: "new-value",
        },
        defaultVariableConfig,
      );

      expect(variable.title("Blue title")).toBe("Blue title");
      expect(variable.userVariableConfig.opts.title).toBe("Blue title");
    });

    it("should create user variable config (and add key-value) during override if it's not defined yet", function () {
      const variable = new Variable(undefined, defaultVariableConfig);
      variable.title("Blue title");

      expect(variable.userVariableConfig).not.toBeUndefined();
      expect(variable.userVariableConfig.key).toBe("value");
      expect(variable.userVariableConfig.opts.title).toBe("Blue title");
    });

    it("should clear user variable config title if set back to default", function () {
      const variable = new Variable(
        {
          key: "new-value",
          opts: {
            title: "Blue title",
            description: "Blue description",
          },
        },
        defaultVariableConfig,
      );

      variable.title("Red title");

      expect(variable.userVariableConfig.opts.title).toBeUndefined();
    });

    it("should clear user variable config options if all set back to default", function () {
      const variable = new Variable(
        {
          key: "new-value",
          opts: {
            title: "Blue title",
          },
        },
        defaultVariableConfig,
      );

      variable.title("Red title");

      expect(variable.userVariableConfig.opts).toBeUndefined();
    });

    it("should keep user variable config even if options set back to default and key-value is default", function () {
      const variable = new Variable(
        {
          key: "value",
          opts: {
            title: "Blue title",
          },
        },
        defaultVariableConfig,
      );

      variable.title("Red title");

      expect(variable.userVariableConfig).not.toBeUndefined();
    });
  });

  describe("keyFromVariableConfig", function () {
    it("should return key if only key is specified", function () {
      expect(
        Variable.keyFromVariableConfig({
          KEY: "RED-VALUE",
        }),
      ).toBe("KEY");
    });

    it("should return key if key and opts are specified", function () {
      expect(
        Variable.keyFromVariableConfig({
          KEY: "RED-VALUE",
          opts: {
            title: "Red title",
          },
        }),
      ).toBe("KEY");
    });

    it("should return undefined if key is not specified", function () {
      expect(Variable.keyFromVariableConfig({})).toBeUndefined();
      expect(
        Variable.keyFromVariableConfig({
          opts: {
            title: "Red title",
          },
        }),
      ).toBeUndefined();
    });
  });

  describe("minimizeVariableConfig", function () {
    it("should remove opts if empty", function () {
      const variable = new Variable({
        opts: {},
      });

      Variable.minimizeVariableConfig(variable.userVariableConfig);

      expect(variable.opts).toBeUndefined();
    });

    it("should leave variable untouched", function () {
      const variable = new Variable({
        opts: {
          title: "Red title",
        },
      });

      Variable.minimizeVariableConfig(variable.userVariableConfig);

      expect(variable.userVariableConfig.opts).not.toBeUndefined();
      expect(variable.userVariableConfig.opts.title).toBe("Red title");
    });
  });
});
