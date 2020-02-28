Feature: Rearrange Workflows

  Rearranging before/after run Workflows is useful for changing the already set before/after run Workflow's order in the Workflow chain.

  Background:
    Given there are Workflows called ci, deploy, _setup, _send-reports, _cleanup
    And the _setup is the before, the _send-reports and the _cleanup are the after run Workflows of the ci Workflow

  Scenario: User opens the Rearrange
    Given the ci Workflow is selected
    When User selects the Rearrange button
    Then the Rearrange popup appears
    And it has the _setup, the ci, the _send-reports and the _cleanup Workflow listed respectively

  Scenario: User moves the selected Workflow
    Given the ci Workflow is selected
    And the Rearrange popup is open
    When User drags the ci Workflow to where the _cleanup Workflow is
    And User confirms with the Done button
    Then the order of the Workflows in the chain will be updated to _setup, _send-reports, _cleanup, ci

  Scenario: User swaps two before/after run Workflows
    Given the ci Workflow is selected
    And the Rearrange popup is open
    When User drags the _cleanup Workflow to where the _send-reports Workflow is
    And User confirms with the Done button
    Then the order of the Workflows in the chain will be updated to _setup, ci, _cleanup, _send-reports

  Scenario: User moves an after run Workflow to where a before run Workflow is
    Given the ci Workflow is selected
    And the Rearrange popup is open
    When User drags the _cleanup Workflow to where the _setup Workflow is
    And User confirms with the Done button
    Then the order of the Workflows in the chain will be updated to _cleanup, ci, _send-reports, _setup

  Scenario: User cancels rearranging Workflows
    Given the ci Workflow is selected
    And the Rearrange popup is open
    When User drags the _send-reports Workflow to where the _cleanup Workflow is
    And User cancels with the Cancel button
    Then the Rearrange popup disappears
    And the order of the Workflows in the chain will remain _setup, ci, _send-reports, _cleanup
