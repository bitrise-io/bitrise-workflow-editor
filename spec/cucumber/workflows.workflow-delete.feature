Feature: Delete Workflow

  Deleting a Workflow results in removing the Workflow, which also means it will not be a before/after run Workflow of any other Workflows.

  Background:
    Given there are Workflows called ci, deploy, _setup
    And the _setup is the before run Workflow of the ci Workflow

  Scenario: User opens the Delete Workflow
    Given the _setup Workflow is selected
    When User selects the Delete Workflow button
    Then the Delete Workflow popup appears
    And it asks for confirmation for deleting the ci Workflow

  Scenario: User confirms deleting a Workflow
    Given the _setup Workflow is selected
    And the Delete Workflow popup is open
    When User confirms with the Yes button
    Then the Delete Workflow popup disappears
    And the Workflow gets deleted
    And it no longer will be the ci Workflow's before run Workflow

  Scenario: User cancels deleting a Workflow
    Given the _setup Workflow is selected
    And the Delete Workflow popup is open
    When User cancels with the No button
    Then the Delete Workflow popup disappears
    And the Workflow does not get deleted
    And it remains the ci Workflow's before run Workflow
