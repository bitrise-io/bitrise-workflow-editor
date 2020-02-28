Feature: Workflow description

  Workflows can have descriptions, which can be customized by the User. They are markdowns, describing information about the Workflow.

  Background:
    Given there is Workflows called ci
    And the ci Workflow is selected

  Scenario: User focuses to a Workflow's description box
    When User selects its description box
    Then the box will enter edit mode

  Scenario: User updates a Workflow's description
    Given the description box is in edit mode
    When User updates the description
    Then the ci Workflow's description will be updated

  Scenario: User unfocuses from a Workflow's description box
    Given the description box is in edit mode
    When User unfocuses from it
    Then the box will leave edit mode
