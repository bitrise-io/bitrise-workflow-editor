describe("Progress", function() {
  let Progress;
  let progress;

  beforeEach(module("BitriseWorkflowEditor"));
  beforeEach(inject(function(_Progress_) {
    Progress = _Progress_;
  }));

  beforeEach(function() {
    progress = new Progress();
  });

  describe("lifecycle", function() {
    it("should be idle by default", function() {
      expect(progress.statusMessage).toBeNull();
      expect(progress.isInProgress).toBe(false);
      expect(progress.isError).toBe(false);
      expect(progress.isIdle).toBe(true);
      expect(progress.cssClass).toBeNull();
    });

    it("should start", function() {
      progress.start("Loading...");

      expect(progress.statusMessage).toBe("Loading...");
      expect(progress.isInProgress).toBe(true);
      expect(progress.isError).toBe(false);
      expect(progress.isIdle).toBe(false);
      expect(progress.cssClass).toBe("in-progress");
    });

    it("should finish with error", function() {
      progress.start("Loading...");
      progress.error(new Error("An error occured."));

      expect(progress.statusMessage).toBe("An error occured.");
      expect(progress.isInProgress).toBe(false);
      expect(progress.isError).toBe(true);
      expect(progress.isIdle).toBe(false);
      expect(progress.cssClass).toBe("error");
    });

    it("should reset if succeeded without message", function() {
      progress.start("Loading...");
      progress.success();

      expect(progress.statusMessage).toBeNull();
      expect(progress.isInProgress).toBe(false);
      expect(progress.isError).toBe(false);
      expect(progress.isIdle).toBe(true);
      expect(progress.cssClass).toBeNull();
    });

    it("should go to success state if succeeded with message", function() {
      progress.start("Loading...");
      progress.success("Success!");

      expect(progress.statusMessage).toBe("Success!");
      expect(progress.isInProgress).toBe(false);
      expect(progress.isError).toBe(false);
      expect(progress.isIdle).toBe(true);
      expect(progress.cssClass).toBe("success");
    });

    it("should reset", function() {
      progress.start("Loading...");
      progress.reset();

      expect(progress.statusMessage).toBeNull();
      expect(progress.isInProgress).toBe(false);
      expect(progress.isError).toBe(false);
      expect(progress.isIdle).toBe(true);
      expect(progress.cssClass).toBeNull();
    });
  });
});
