describe("Step", function () {
  let Step;

  beforeEach(module("BitriseWorkflowEditor"));
  beforeEach(inject(function (_Step_) {
    Step = _Step_;
  }));

  let step;

  beforeEach(function () {
    step = new Step();
  });

  const fields = [
    { name: "title", config_name: "title" },
    { name: "summary", config_name: "summary" },
    { name: "description", config_name: "description" },
    { name: "assetUrls", config_name: "asset_urls" },
    { name: "isDeprecated", config_name: "is_deprecated", readOnly: true },
  ];

  _.each(fields, (field) => {
    describe(`Getter/Setters: ${field.name}`, () => {
      const defaultStepConfig = {
        [field.config_name]: `Default ${field.name}`,
      };

      it(`should return overridden ${field.name}`, () => {
        step.defaultStepConfig = defaultStepConfig;

        step.userStepConfig = {
          [field.config_name]: `New ${field.name}`,
        };

        expect(step[field.name]()).toBe(`New ${field.name}`);
      });

      it(`should return default ${field.name} if not overridden`, () => {
        step.defaultStepConfig = defaultStepConfig;

        expect(step[field.name]()).toBe(`Default ${field.name}`);

        step.userStepConfig = {
          test: "New description",
        };

        expect(step[field.name]()).toBe(`Default ${field.name}`);
      });

      it(`should return undefined if nor default nor user defines ${field.name}`, () => {
        step.defaultStepConfig = {
          test: "Default description",
        };

        expect(step[field.name]()).toBeUndefined();
      });

      if (!field.readOnly) {
        it(`should override ${field.name}`, () => {
          step.defaultStepConfig = defaultStepConfig;
          step.userStepConfig = {};

          expect(step[field.name](`New ${field.name}`)).toBe(
            `New ${field.name}`,
          );
          expect(step.userStepConfig[field.config_name]).toBe(
            `New ${field.name}`,
          );
        });

        it("should set user step config if not defined yet", () => {
          step.defaultStepConfig = defaultStepConfig;

          step[field.name](`New ${field.name}`);

          expect(step.userStepConfig).not.toBeUndefined();
          expect(step.userStepConfig[field.config_name]).toBe(
            `New ${field.name}`,
          );
        });

        it("should remove title from user config if new is default", () => {
          step.defaultStepConfig = defaultStepConfig;

          expect(step[field.name](`New ${field.name}`)).toBe(
            `New ${field.name}`,
          );
          expect(step[field.name](`Default ${field.name}`)).toBe(
            `Default ${field.name}`,
          );
          expect(step.userStepConfig[field.config_name]).toBeUndefined();
          expect(step.defaultStepConfig[field.config_name]).toBe(
            `Default ${field.name}`,
          );
        });
      }
    });
  });

  describe("displayName", function () {
    it("should return title if title is defined and not empty", function () {
      const stepTitle = "Test step";
      step.defaultStepConfig = {
        title: stepTitle,
      };

      expect(step.displayName()).toBe(stepTitle);
    });

    it("should return id if title is not defined but id is defined", function () {
      const stepId = "step-1";
      step.id = stepId;

      expect(step.displayName()).toBe(stepId);
    });

    it("should return the last cvs segment, no fragment", function () {
      const testStepName = "test_step";
      step.cvs = `path::${testStepName}`;

      expect(step.displayName()).toBe(testStepName);
    });

    it("should return the last cvs fragment, single fragment", function () {
      const testStepName = "test_step";
      step.cvs = `path::./${testStepName}`;

      expect(step.displayName()).toBe(testStepName);
    });

    it("should return last cvs fragment, multiple fragments", function () {
      const testStepName = "test_step";
      step.cvs = `path::./dir/sub/${testStepName}`;

      expect(step.displayName()).toBe(testStepName);
    });
  });

  describe("displayCvs", function () {
    it("should return cvs itself when not starting with git:: or path::", function () {
      step.cvs = "./test/step";

      expect(step.displayCvs()).toBe(step.cvs);
    });

    it("should return cvs without git:: prefix", function () {
      const githubUrl = "https://github.com/bitrise-steplib/step-scripts";
      step.cvs = `git::${githubUrl}`;

      expect(step.displayCvs()).toBe(githubUrl);
    });

    it("should return cvs without path:: prefix", function () {
      const path = "./steps/test_step";
      step.cvs = `path::${path}`;

      expect(step.displayCvs()).toBe(path);
    });
  });

  describe("displayTooltip", function () {
    it("should return displayName and cvs concatenated", function () {
      const stepTitle = "Step title";
      const path = "./dir/sub/step";
      step.defaultStepConfig = {
        title: "Step title",
      };
      step.cvs = `path::${path}`;

      expect(step.displayTooltip()).toBe(`${stepTitle}\n${path}`);
    });
  });

  describe("isValidTitle", function () {
    it("should return undefined if title is not defined", function () {
      expect(Step.isValidTitle(undefined)).toBeUndefined();
    });

    it("should return false if title is empty", function () {
      expect(Step.isValidTitle("")).toBeFalsy();
    });

    it("should return true", function () {
      expect(Step.isValidTitle("ABCdef")).toBeTruthy();
      expect(Step.isValidTitle("ABC1def")).toBeTruthy();
      expect(Step.isValidTitle("ABC.DEF")).toBeTruthy();
      expect(Step.isValidTitle("ABC DEF")).toBeTruthy();
      expect(Step.isValidTitle("ABC?DEF")).toBeTruthy();
    });
  });

  describe("iconURL", function () {
    it("should return default svg if no user step config is defined", function () {
      step.defaultStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
        },
      };

      expect(step.iconURL()).toBe("red-icon.svg");
    });

    it("should return default png if no svg and user step config is defined", function () {
      step.defaultStepConfig = {
        asset_urls: {
          "icon.png": "red-icon.png",
        },
      };

      expect(step.iconURL()).toBe("red-icon.png");
    });

    it("should return default svg even if default png is also defined", function () {
      step.defaultStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
          "icon.png": "blue-icon.png",
        },
      };

      expect(step.iconURL()).toBe("red-icon.svg");
    });

    it("should return user defined svg if defined", function () {
      step.defaultStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
        },
      };
      step.userStepConfig = {
        asset_urls: {
          "icon.svg": "blue-icon.svg",
        },
      };

      expect(step.iconURL()).toBe("blue-icon.svg");
    });

    it("should return user defined png if defined", function () {
      step.defaultStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
        },
      };
      step.userStepConfig = {
        asset_urls: {
          "icon.png": "blue-icon.png",
        },
      };

      expect(step.iconURL()).toBe("blue-icon.png");
    });

    it("should set icon URL svg if no default nor user step config is defined", function () {
      expect(step.iconURL("red-icon.svg")).toBe("red-icon.svg");
      expect(step.defaultStepConfig).toBeUndefined();
      expect(step.userStepConfig).not.toBeUndefined();
      expect(step.userStepConfig.asset_urls).not.toBeUndefined();
      expect(step.userStepConfig.asset_urls["icon.svg"]).toBe("red-icon.svg");
      expect(step.userStepConfig.asset_urls["icon.png"]).toBeUndefined();
    });

    it("should change icon URL svg", function () {
      step.userStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
        },
      };

      step.iconURL("blue-icon.svg");

      expect(step.userStepConfig.asset_urls["icon.svg"]).toBe("blue-icon.svg");
    });

    it("should keep png, add svg", function () {
      step.userStepConfig = {
        asset_urls: {
          "icon.png": "red-icon.png",
        },
      };

      step.iconURL("blue-icon.svg");

      expect(step.userStepConfig.asset_urls["icon.svg"]).toBe("blue-icon.svg");
      expect(step.userStepConfig.asset_urls["icon.png"]).toBe("red-icon.png");
    });

    it("should not change anything if icon type is not supported", function () {
      step.userStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
        },
      };

      step.iconURL("blue-icon.bmp");

      expect(step.userStepConfig.asset_urls["icon.svg"]).toBe("red-icon.svg");
      expect(step.userStepConfig.asset_urls["icon.bmp"]).toBeUndefined();
    });

    it("should clear svg if is set to default", function () {
      step.defaultStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
        },
      };
      step.userStepConfig = {
        asset_urls: {
          "icon.svg": "blue-icon.svg",
          "icon.png": "blue-icon.png",
        },
      };

      step.iconURL("red-icon.svg");

      expect(step.userStepConfig.asset_urls["icon.svg"]).toBeUndefined();
    });

    it("should clear asset URLs if all icon URLs are set to default", function () {
      step.defaultStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
        },
      };
      step.userStepConfig = {
        title: "red-title",
        asset_urls: {
          "icon.svg": "blue-icon.svg",
        },
      };

      step.iconURL("red-icon.svg");

      expect(step.userStepConfig.asset_urls).toBeUndefined();
    });

    it("should clear user step config if all is set to default", function () {
      step.defaultStepConfig = {
        asset_urls: {
          "icon.svg": "red-icon.svg",
        },
      };
      step.userStepConfig = {
        asset_urls: {
          "icon.svg": "blue-icon.svg",
        },
      };

      step.iconURL("red-icon.svg");

      expect(step.userStepConfig).toEqual({});
    });
  });

  describe("verified", function () {
    it("should not be verified if there is no information exists", function () {
      expect(step.isVerified()).toBeFalsy();
    });
  });

  describe("requestedVersion", function () {
    it("should return null if cvs requests version to always latest", function () {
      const step = new Step("red-step");

      expect(step.requestedVersion()).toBeNull();

      step.version = "1.1";

      expect(step.requestedVersion()).toBeNull();
    });

    it("should return cvs requested version of step", function () {
      const step = new Step("red-step@1.0");
      step.version = "1.0";

      expect(step.requestedVersion()).toBe("1.0");
    });
  });

  describe("cvsFromWrappedStepConfig", function () {
    it("should return CVS", function () {
      expect(
        Step.cvsFromWrappedStepConfig({
          "red-source::green-step@1.0": {
            title: "Green step",
          },
        }),
      ).toBe("red-source::green-step@1.0");
    });
  });
});
