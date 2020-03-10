Feature: Workflows

  Adding a Workflow is possible by providing a name for it, and either starting out with an empty one, or as a duplication of a selectable existing one.

  Background:
    Given editor is open

  Scenario: Steps sidebar
    Then I should see "GitHub Status" in "First step"
    And I should see "Script" in "Second step"

  Scenario: User creates a Workflow
    When I click on "Add Workflow Button"
    And I select "Empty workflow" from "Workflow Type Dropdown"
    And I type "TestWorkflow" in "Workflow Name"
    And I click on "Workflow Add Button"
    Then "Workflow Add Popup" should "not be visible"
    And Workflow appeared with name "Test"

  Scenario: Delete Workflow
    Given Workflow with name "ToBeDeleted"
    When I click on "Delete Workflow Button"
    And I confirm on "default" popup
    Then I should not see "ToBeDeleted" in "Selected Workflow Name"
    And I should see "wf1" in "Selected Workflow Name"

