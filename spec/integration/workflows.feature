Feature: Workflows

  Adding a Workflow is possible by providing a name for it, and either starting out with an empty one, or as a duplication of a selectable existing one.

  Background:
    Given editor is open

  Scenario: User creates a Workflow
    When I click on "Add Workflow Button"
    And I select "Empty workflow" from "Workflow Type Dropdown"
    And I type "TestWorkflow" in "Workflow Name"
    And I click on "Workflow Add Button"
    Then I should not see "Workflow Add Popup"
    And Workflow appeared with name "Test"

  Scenario: Delete Workflow
    When I click on "Delete Workflow Button"
    And I confirm on "default" popup
    Then I should not see "TestWorkflow" in "Selected Workflow Name"

  Scenario: Steps sidebar
    Then I should see "GitHub Status" in "First step"
    And I should see "Script" in "Second step"

  Scenario: Step's selected
    When I click on "First step"
    Then I should see "GitHub Status" in "Step Title"
    Then I should see "2.2.2" in "Step Version"
    And "Step Versions" should "be visible"
    And "Step Inputs" should "be visible"
    And I should see "Step's latest version is: 2.2.2" in "Step Versions"
    And "Save Button" should "be disabled"

  Scenario: Version Downgrade
    When I click on "First step"
    And I select "1.0.x" from "Version selector"
    And I confirm on "alert" popup
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
    And I confirm on "alert" popup
    And I click on "Step Latest Version Updater"
    Then I should see "Version: 2.2.2" in "Step Versions"
    And "Step Version Success Icon" should "be visible"

  Scenario: Always latest vs latest major lock
    When I click on "Third step"
    Then I should see "Version: 4.0.5" in "Step Version"
    When I select "4.x.x" from "Version selector"
    Then I should see "Version: 4.0.5" in "Step Versions"
