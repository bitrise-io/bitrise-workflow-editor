Feature: Workflow steps list

  Steps of any Workflow are listed, they can be selected, and their name, version, icon & badges are displayed.

  Background:
    Given editor is open

  Scenario: Selecting step which is referenced by path, in another workflow, does not alter app config
    Given "wf3" workflow is selected
    When I click on "First Workflow's second step"
    Then "Save Button" should "be disabled"
