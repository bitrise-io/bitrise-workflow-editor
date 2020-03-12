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

  Scenario: User adds a before workflow
    When I click on "Add Before Workflow button"
    And I select "wf4" from "Before Workflow Dropdown"
    And I confirm on "Add Before Workflow" popup
    Then I should see "wf4" in "Before Workflow Name"

  Scenario: User cancels adding a before workflow
    When I click on "Add Before Workflow button"
    And I select "wf4" from "Before Workflow Dropdown"
    And I cancel on "Add Before Workflow" popup
    Then "Workflow Sections" should have number of "1"

  Scenario: User adds a after workflow
    When I click on "Add After Workflow button"
    And I select "wf4" from "After Workflow Dropdown"
    And I confirm on "Add After Workflow" popup
    Then I should see "wf4" in "After Workflow Name"

  Scenario: User cancels adding an after workflow
    When I click on "Add After Workflow button"
    And I select "wf4" from "After Workflow Dropdown"
    And I confirm on "Add After Workflow" popup
    Then "Workflow Sections" should have number of "1"

