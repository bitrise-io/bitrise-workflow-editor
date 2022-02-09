Feature: Workflow steps details

  The selected Step's properties can be viewed & some of them can be edited.
  Steps of any Workflow are listed, they can be selected, and their name, version, icon & badges are displayed.

  Background:
    Given workflows tab is open

  Scenario: Step title scenarios
    When I click on "Sixth step"
    Then I should see "Install Swiftlint 0.35" in "Step Title"
    When I click on "Seventeenth step"
    Then I should see "[BETA] iOS Device Testing" in "Step Title"
    When I select "wf2 workflow" from "Workflow selector"
      And I click on "First step"
    Then I should see "A script step referenced by git URL" in "Step Title"
    When I click on "Second step"
    Then I should see "Script" in "Step Title"
    When I click on "Third step"
    Then I should see "steps-script@master" in "Step Title"
    When I click on "Fourth step"
    Then I should see "A local step" in "Step Title"
    When I click on "Fifth step"
    Then I should see "A local step with overwritten title & input" in "Step Title"
    When I click on "Sixth step"
    Then I should see "test_local_step" in "Step Title"
    When I select "wf4 workflow" from "Workflow selector"
      And I click on "Second step"
    Then I should see "untitled_step" in "Step Title"
    When I click on "Step Title"
    Then "Step Title Edit Box" should "be empty"

  Scenario: Step rename
    When I click on "Sixth step"
      And I click on "Step Title"
    Then "Step Title Edit Box" should "have value: Install Swiftlint 0.35"
    When I clear "Step Title Edit Box"
      And I type "my custom name" in "Step Title Edit Box"
    Then I wait 300
    When I click on "Step Rename Confirm Button"
    Then I should see "my custom name" in "Step Title"

  Scenario: Step details check (versioning etc...)
    # Up-to-date library step
    Then "First StepItem Version Update Indicator" should "not be visible"
    # Non up-to-date library step
    When I click on "Second step"
    Then "Step Version Details" should "be visible"
      And "Step Version Update Icon" should "be visible"
      And "Step Version Selector" should "be visible"
      And I should see "Version: 1.1.5" in "Step Version"
      And I should see "1.1.5" in "Second StepItem Version Update Indicator"
    When I select "wf2 workflow" from "Workflow selector"
      And I click on "Second step"
    # GitHub step
    Then "Second StepItem Version Update Indicator" should "not be visible"
      And I should see "master" in "Second StepItem Version"
      And "Step Version Details" should "be visible"
      And "Step Version Update Icon" should "not be visible"
      And "Step Version Selector" should "not be visible"
      And "Step Version Branch Icon" should "be visible"
      And I should see "Branch: master" in "Step Version"
    # Local step
    When I click on "Fourth step"
    Then "Forth StepItem Version Update Indicator" should "not be visible"
      And I should see "Always latest" in "Fourth StepItem Version"
      And "Step Version Details" should "not be visible"
    When I click on "Eighth step"
    Then "Step Version Details" should "be visible"
      And "Step Version Selector" should "be visible"
    When I change tab to "Trigger tab"
      And I change tab to "Workflows tab"
    Then "Eighth step" should be the selected step

  Scenario: Version Downgrade
    When I click on "First step"
    Then "First StepItem Version Update Indicator" should "not be visible"
      And I should see "2.4.0" in "First StepItem Version"
      And "Step Version Details" should "be visible"
      And I should see "2.4.0" in "Step Version"
      And "Step Version Selector" should "be visible"
      And "Step Version Branch Icon" should "exist"
      And "Step Version Update Icon" should "not exist"
    When I select "1.0.x" from "Step Version Selector"
      And I confirm on "Alert popup"
      And I scroll "Step edit container" to 100px
    Then "Save Button" should "not be disabled"
      And "Step Version Branch Icon" should "not exist"
      And "Step Version Update Icon" should "exist"
      And I should see "Version: 1.0.4" in "Step Version"
      And I should see "1.0.x" in "First StepItem Version Update Indicator"

  # For some reason this scenario started to fail at some point,
  # because "Step Version Update Icon" not being visible (which means that
  # the element is actually in the DOM AND currently visible for the user).
  # It probably has something to do with this GitHub issue: https://github.com/cypress-io/cypress/issues/2353
  # To properly solve the issue we should update Cypress at least to version 6,
  # but until that we check the element's existence, not its visibility,
  # "exist" instead of "be visible" and "not exist" instead of "not be visible".
  Scenario: Version Update
    When I click on "Second step"
    Then I should see "1.1.5" in "Second StepItem Version Update Indicator"
      And "Step Version Details" should "be visible"
      And I should see "Version: 1.1.5" in "Step Version"
      And "Step Version Selector" should "be visible"
      And "Step Version Update Icon" should "exist"
      And "Step Version Branch Icon" should "not exist"
    When I select "1.x.x" from "Step Version Selector"
    Then "Save Button" should "not be disabled"
      And I should see "Version: 1.1.6" in "Step Version"
      And "Step Version Branch Icon" should "exist"
      And I should see "1.x.x" in "Second StepItem Version"
      And "Second StepItem Version Update Indicator" should "not be visible"
      And "Step Version Update Icon" should "not exist"

  # For some reason this scenario started to fail at some point,
  # because "Step Version Update Icon" not being visible (which means that
  # the element is actually in the DOM AND currently visible for the user).
  # It probably has something to do with this GitHub issue: https://github.com/cypress-io/cypress/issues/2353
  # To properly solve the issue we should update Cypress at least to version 6,
  # but until that we check the element's existence, not its visibility,
  # "exist" instead of "be visible" and "not exist" instead of "not be visible".
  Scenario: Latest Version Update
    When I click on "First step"
    Then "First StepItem Version Update Indicator" should "not be visible"
      And I should see "2.4.0" in "First StepItem Version"
      And "Step Version Details" should "be visible"
      And I should see "2.4.0" in "Step Version"
      And "Step Version Selector" should "be visible"
      And "Step Version Branch Icon" should "exist"
      And "Step Version Update Icon" should "not exist"
    When I select "1.0.x" from "Step Version Selector"
      And I confirm on "Alert popup"
      And I scroll "Step edit container" to 100px
    Then I should see "1.0.x" in "First StepItem Version Update Indicator"
      And I should see "Version: 1.0.4" in "Step Version"
      And "Step Version Update Icon" should "exist"
    When I click on "Step Version Update Icon"
      And I confirm on "Alert popup"
    Then I should see "Version: 2.4.0" in "Step Version"
      And "Step Version Branch Icon" should "exist"
      And "Step Version Update Icon" should "not exist"
      And I should see "2.x.x" in "First StepItem Version"
      And "First StepItem Version Update Indicator" should "not be visible"
    When I click on "Eighteenth step"
    Then I should see "1.7.1" in "Eighteenth StepItem Version"
      And I scroll "Step edit container" to 100px
      And I should see "Deploy to Bitrise.io - Apps, Logs, Artifacts" in "Step Title"
      And I should see "Version: 1.7.1" in "Step Version"
      And "Step Version Selector" should "be visible"
      And "Step Version Branch Icon" should "not exist"
      And "Step Version Update Icon" should "exist"
    When I select "1.13.x" from "Step Version Selector"
    Then I should see "1.13.x" in "Eighteenth StepItem Version"
      And I should see "1.13.2" in "Step Version"
      And "Step Version Branch Icon" should "not exist"
      And "Step Version Update Icon" should "exist"
    When I select "1.x.x" from "Step Version Selector"
    Then I should see "1.x.x" in "Eighteenth StepItem Version"
      And I should see "1.13.2" in "Step Version"
      And "Step Version Branch Icon" should "not exist"
      And "Step Version Update Icon" should "exist"
    When I select "2.x.x" from "Step Version Selector"
      And I confirm on "Alert popup"
    Then I should see "2.x.x" in "Eighteenth StepItem Version"
      And I should see "2.0.3" in "Step Version"
      And "Step Version Branch Icon" should "exist"
      And "Step Version Update Icon" should "not exist"

  Scenario: Always latest vs latest major lock
    When I click on "Third step"
    Then I should see "Version: 4.1.0" in "Step Version"
      And I should see "Always latest" in "Third StepItem Version"
    When I select "4.x.x" from "Step Version Selector"
    Then I should see "Version: 4.1.0" in "Step Version"
      And I should see "4.x.x" in "Third StepItem Version"

  Scenario: Step with always run capabilities
    Given "wf4" workflow is selected
    When I click on "Third step"
    Then I should see "A local step with overwritten summary" in "Step Description"
      And "Step Always run indicator" should "be checked"
    When I click on "Step Description Toggle"
    Then I should see "This local step has its description overwritten" in "Step Description"
    When I click on "Fourth step"
    Then "Step Always run indicator" should "not be checked"
    When I check "Step Always run indicator"
    Then "Discard Button" should "be enabled"
    When I uncheck "Step Always run indicator"
    Then "Discard Button" should "be disabled"

  Scenario: Steps badges: official, community, verified, deprecation
    Given "wf5" workflow is selected
    When I click away
    Given First step is selected
    Then I should see "Script" in "First step"
      And "Official Maintianer Badge" in "First step" should have attribute "title" with value "Bitrise step"
    When I click on "Second step"
    Then "Deprecated Maintianer Badge" should "be visible"

  Scenario: User deletes the Step
    When I click on "First step"
      And I click on "Step Delete Button"
    Then I should not see "GitHub Status" in "First step"
      And I should see "Script" in "First step"
      And no step selected
    When I click on "Second step"
      And I click on "Step Delete Icon"
    Then I should not see "Activate SSH key (RSA private key)" in "Second step"
      And no step selected

  Scenario: User clones Step
    Given "wf5" workflow is selected
      And First step is selected
    When I click on "Step clone button"
    Then I should see "Script" in "Second step"

  Scenario: User visits the source code of a Step having one
    Given "wf5" workflow is selected
      And First step is selected
    Then "Step source link" should have attribute "target" with value "_blank"
