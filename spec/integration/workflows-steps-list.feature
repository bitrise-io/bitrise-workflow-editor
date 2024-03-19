Feature: Workflow steps list

  Steps of any Workflow are listed, they can be selected, and their name, version, icon & badges are displayed.

  Background:
    Given workflows tab is open

  Scenario: Selecting step which is referenced by path, in another workflow, does not alter app config
    Given "wf3" workflow is selected
    When I click on "First Workflow's second step"
    Then "Save Button" should "be disabled"

  Scenario: Selecting step in an after workflow, then leaving tab & returning, does not alter app config
    Given "wf3" workflow is selected
    When I click on "Third Workflow's first step"
    And I change tab to "Triggers tab"
    And I change tab to "Workflows tab"
    Then I wait 5000
    Then "Save Button" should "be disabled"
