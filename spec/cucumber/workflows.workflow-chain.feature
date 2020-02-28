Feature: Workflow chain

  Whenever a Workflow is selected, its chain is displayed in the Workflow tab's main block, along with its before/after run Workflows, and all of their Steps.

  Background:
    Given there are Workflows called ci, deploy, _setup, _cleanup, _noop
    And the ci Workflow's before run Workflow is the _setup, the after run Workflows are the _noop, _cleanup, _cleanup
    And each having some Steps except the _noop Workflow

  Scenario: User selects a Workflow
    When User selects the ci Workflow
    Then the _setup, the ci, the _noop and the _cleanup Workflows appear in a list respectively
    And all Workflows except the _noop Workflow have Steps listed underneath their names
    And the ci Workflow's background is white
    And it has its stack displayed
    And it has its description box displayed
    And it has add Step buttons before and after every Step
    And the other Workflows' background is grey
    And they have a delete button next to their name
    And they don't have their stack displayed
    And they don't have add Step buttons between their Steps
    But the _noop Workflow has one add Step button in the same place where the other Workflows have their Steps

  Scenario: User selects a duplicate Workflow in the chain
    Given the ci Workflow is selected
    When User selects the first _cleanup Workflow's heading
    Then it has its description box displayed
    And add Step buttons appear before and after its every Step

  Scenario: User selects the delete button of an after run Workflow
    Given the ci Workflow is selected
    When User selects the delete button of the first _cleanup after run Workflow
    Then that first _cleanup after run Workflow will disappear from the list, along with its Steps
    But the second _cleanup after run Workflow will remain there
