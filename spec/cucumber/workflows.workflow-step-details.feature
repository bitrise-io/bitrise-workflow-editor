Feature: Workflow Step details

  The selected Step's properties can be viewed & some of them can be edited.

  Background:
    Given there is Workflows called ci, with a Script Step
    And the Script is selected

  Scenario: Step has a custom name
    Given the Step has the title 'Custom Step' property set in bitrise.yml
    Then the displayed name will be 'Custom Step'

  Scenario: Verified Steps have the green badge displayed
    Given the Step is verified
    Then the green verified badge appears next to the Step's name

  Scenario: Verified badges display their category in a tooltip on hover
    Given the Step is verified
    When User hovers the green verified badge
    Then the phrase Verified shows up in a tooltip

  Scenario: Community-created Steps have the purple badge displayed
    Given the Step is community-created
    Then the purple community-created badge appears next to the Step's name

  Scenario: Community-created badges display their category in a tooltip on hover
    Given the Step is community-created
    When User hovers the green community-created badge
    Then the phrase Community-created shows up in a tooltip

  Scenario: Deprecated Steps have the purple badge displayed
    Given the Step is deprecated
    Then the purple deprecated badge appears next to the Step's name

  Scenario: Deprecated badges display their category in a tooltip on hover
    Given the Step is deprecated
    When User hovers the green deprecated badge
    Then the phrase Deprecated shows up in a tooltip

  Scenario: User starts to rename the Step
    When User selects the Step name
    Then the Step name enters edit mode

  Scenario: User confirms renaming the Step
    Given the Step name is in edit mode
    When User changes the Step name
    And selects the confirm button
    Then the Step name gets updated

  Scenario: User clones Step
    When User selects the clone button on the right
    Then a duplication of the Step (along with all its modified properties) is added to the Workflow, right after the original Step
    And the new Step gets selected

  Scenario: User visits the source code of a Step having one
    Given the Step has source code URL set
    When User selects the source code button on the right
    Then the Step's GitHub repository opens in a new tab

  Scenario: Step without source code
    Given the Step does not have source code URL set
    Then there will be no source code button on the right

  Scenario: User deletes the Step
    When User selects the delete button on the right
    Then the Step gets removed from the Workflow
    And there will be no selected Step
    But the Workflow itself will remain selected in the chain

  Scenario: Step without description and summary
    Given the Step does not have description set
    And the Step does not have summary set
    Then there will be no description section

  Scenario: Step without description, only summary
    Given the Step does not have description set
    But it has summary
    Then the description section will contain the summary as markdown

  Scenario: User expands the description of the Step having only summary set
    Given the Step does not have description set
    But it has summary
    When User expands the description
    Then the summary will be visible as markdown

  Scenario: Step with description, without summary
    Given the Step has description set
    But it does not have summary
    Then the description section will contain the description as markdown oneliner

  Scenario: User expands the description of the Step having only description set
    Given the Step has description set
    But it does not have summary
    When User expands the description
    Then the description will be visible as markdown

  Scenario: Step with both description and summary
    Given the Step has description set
    And it has summary
    Then the description section will contain the summary as markdown oneliner

  Scenario: User expands the description of the Step having both description and summary set
    Given the Step has description set
    And it has summary
    When User expands the description
    Then the description will be visible as markdown
