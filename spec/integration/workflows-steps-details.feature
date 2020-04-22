Feature: Workflow steps details

  The selected Step's properties can be viewed & some of them can be edited.
  Steps of any Workflow are listed, they can be selected, and their name, version, icon & badges are displayed.

  Background:
    Given editor is open

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
    Then I should see "A local step" in "Step Title"
    When I select "wf4 workflow" from "Workflow selector"
        And I click on "Second step"
    Then I should see "path::./spec/integration/fixture/untitled_step" in "Step Title"
    When I click on "Step Title"
    Then "Step Title Edit Box" should "be empty"

  Scenario: Step rename
    When I click on "Sixth step"
    And I click on "Step Title"
    Then "Step Title Edit Box" should "have value: Install Swiftlint 0.35"
    When I clear "Step Title Edit Box"
      And I type "my custom name" in "Step Title Edit Box"
      And I wait 300
      And I click on "Step Rename Confirm Button"
    Then I should see "my custom name" in "Step Title"

  Scenario: Step details check (versioning etc...)
    Given "wf2" workflow is selected
    When I click on "Second step"
    Then "Step Versions" should "be visible"
      And "Version selector" should "not be visible"
    When I click on "Third step"
    Then "Step Versions" should "not be visible"
    When I click on "Sixth step"
    Then "Step Versions" should "be visible"
      And "Version selector" should "be visible"
    When I change tab to "Trigger tab"
      And I change tab to "Workflows tab"
    Then "Sixth step" should be the selected step

  Scenario: Version Downgrade
    When I click on "First step"
      And I select "1.0.x" from "Version selector"
      And I confirm on "Alert popup"
      And "Step Version Danger Icon" should "be visible"
      And "Save Button" should "not be disabled"
    Then "First step version indicator" should "be visible"
      And I should see "Version: 1.0.4" in "Step Versions"
      And "Step Latest Version Updater" should "be visible"

  Scenario: Version Update
    When I click on "Second step"
    Then I should see "Version: 1.1.5" in "Step Versions"
      And I should see "1.1.5" in "Second step version updater"
    When I select "1.x.x" from "Version selector"
    Then I should see "Version: 1.1.6" in "Step Versions"
      And "Step Version Success Icon" should "be visible"
      And "Save Button" should "not be disabled"

  Scenario: Latest Version Update
    When I click on "First step"
      And I select "1.0.x" from "Version selector"
      And I confirm on "Alert popup"
      And I click on "Step Latest Version Updater"
    Then I should see "Version: 2.2.2" in "Step Versions"
      And "Step Version Success Icon" should "be visible"

  Scenario: Always latest vs latest major lock
    When I click on "Third step"
    Then I should see "Version: 4.0.5" in "Step Version"
    When I select "4.x.x" from "Version selector"
    Then I should see "Version: 4.0.5" in "Step Versions"

  Scenario: Step with always run capabilities
    Given "wf4" workflow is selected
    When I click on "Third step"
    Then I should see "A local step with overwritten summary" in "Step Description"
      And "Step Always run indicator" should "be checked"
    When I click on "Step Description Toggle"
    Then I should see "This local step has its description overwritten" in "Step Description"
    Then I click on "Fourth step"
      And "Step Always run indicator" should "not be checked"
    When I check "Step Always run indicator"
    Then "Discard Button" should "be enabled"
    When I uncheck "Step Always run indicator"
    Then "Discard Button" should "be disabled"

  Scenario: Steps badges: community, verified, deprecation
    Given "wf4" workflow is selected
    When I click on "First step"
    Then "Step Verified Badge" should "be visible"
    When I click on "Fourth step"
    Then "Step Community Badge" should "be visible"
    When I select "wf5 workflow" from "Workflow selector"
      And I click on "Second step"
    Then "Step Deprecation Badge" should "be visible"

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
