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
    And I confirm on popup
    Then I should not see text "TestWorkflow" in "Selected Workflow Name"

