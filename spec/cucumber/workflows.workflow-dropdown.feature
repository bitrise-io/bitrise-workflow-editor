Feature: Workflow dropdown

  The Workflow dropdown is used for selecting & renaming any Workflow of the app.

  Background:
    Given there are Workflows called ci, deploy, _setup

  Scenario: User opens the Workflow dropdown
    Given the ci Workflow is the selected one
    When User selects the Workflow dropdown's opener button
    Then it appears with the ci, deploy, _setup Workflows in it
    And the ci Workflow has purple background, marked with a tick, and has a rename button on the right side

  Scenario: User selects a Workflow from the Workflow dropdown
    Given the Workflow dropdown is open
    When User selects the ci Workflow
    Then the ci Workflow will be the selected Workflow, appearing below the Workflows tab's control bar

  Scenario: User selects rename for a Workflow in the Workflow dropdown
    Given the Workflow dropdown is open
    When User selects rename for the ci Workflow
    Then the ci Workflow's entry will enter edit mode
    And User can enter & confirm a different name for the Workflow

  Scenario: User confirms renaming a Workflow in the Workflow dropdown
    Given the Workflow dropdown is open
    When User selects rename for the ci Workflow and enters the name test for it
    And User confirms the rename
    Then Workflow will have name test
    And its entry will exit edit mode

  Scenario: User leaves the Workflow dropdown by clicking outside of it
    Given the Workflow dropdown is open
    When User clicks outside of it
    Then the Workflow dropdown will close

  Scenario: User leaves the Workflow dropdown by pressing the ESC key
    Given the Workflow dropdown is open
    When User presses the ESC key
    Then the Workflow dropdown will close

  Scenario: User leaves the Workflow dropdown by selecting its opener button
    Given the Workflow dropdown is open
    When User selects its opener button
    Then the Workflow dropdown will close
