Feature: Workflow Step list

  Steps of any Workflow are listed, they can be selected, and their name, version, icon & badges are displayed.

  Background:
    Given editor is open

  Scenario: Selecting step which is referenced by git URL, in another workflow, does not alter app config
    When I click on "Script step referenced by git URL"
    Then I wait 300
    Then "Save Button" should "be disabled"
