Feature: Add Workflow before/after

  Adding a Workflow as a before/after run Workflow, will have that before/after run Workflow be executed prior to whenever the target Workflow is executed.

  Background:
    Given there are Workflows called ci, deploy, _setup

  Scenario Outline: User opens the Add Workflow before/after
    Given the deploy Workflow is selected
    When User selects the Add Workflow <target> button
    Then the Add Workflow <target> popup appears
    And it has a Select Workflow button above a placeholder for the selected deploy Workflow

    Examples:
      | target |
      | before |
      |  after |

  Scenario Outline: User sets a Workflow as a before/after run Workflow for another one
    Given the deploy Workflow is selected
    And the Add Workflow <target> popup is open
    When User selects the ci Workflow from the dropdown
    And User confirms add Workflow <target>
    Then the Add Workflow <target> popup disappears
    And the ci Workflow will be added as a <target> run Workflow for the deploy Workflow

    Examples:
      | target |
      | before |
      |  after |

  Scenario Outline: User cancels setting a Workflow as a before/after run Workflow
    Given the deploy Workflow is selected
    And the Add Workflow <target> popup is open
    When User selects the ci Workflow from the dropdown
    And User cancels add Workflow <target>
    Then the Add Workflow <target> popup disappears
    And the ci Workflow won't be added as a <target> run Workflow
    And re-opening the Add Workflow <target> popup will show the dropdown in the original unspecified state

    Examples:
      | target |
      | before |
      |  after |
