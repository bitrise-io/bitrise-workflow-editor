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
    Then I should see "path::./spec/integration/fixture/titleless_step" in "Step Title"
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

  Scenario: Version Downgrade
    When I click on "First step"
      And I select "1.0.x" from "Version selector"
      And I confirm on "Alert popup"
    Then "First step version indicator" should "be visible"
      And I should see "Version: 1.0.4" in "Step Versions"
      And "Step Latest Version Updater" should "be visible"

  Scenario: Version Update
    When I click on "First step"
      And I select "2.x.x" from "Version selector"
    Then I should see "Version: 2.2.2" in "Step Versions"
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

  Scenario: Step with other custom properties
    Given "wf4" workflow is selected
    When I click on "Third step"
    Then I should see "A local step with overwritten summary" in "Step Description"
      And "Step Always run indicator" should be switched "on"
    When I click on "Step Description Toggle"
    Then I should see "This local step has its description overwritten" in "Step Description"

  Scenario: Verified Steps have the green badge displayed
    Given "wf4" workflow is selected
    When I click on "First step"
    Then "Step Verified Badge" should "be visible"
    When I click on "Fourth step"
    Then "Step Community Badge" should "be visible"

  Scenario: User deletes the Step
    When I click on "First step"
      And I click on "Step Delete Button"
    Then I should not see "GitHub Status" in "First step"
      And I should see "Script" in "First step"
      And no step selected
