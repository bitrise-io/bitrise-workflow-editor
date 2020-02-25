Feature: Workflow Step list

  Steps of any Workflow are listed, they can be selected, and their name, version, icon & badges are displayed.

  Background:
    Given there is Workflows called ci, with a before run Workflow _setup
    And the ci Workflow is selected

  Scenario: Step's version is latest due to not being set in bitrise.yml
    Given a Step's version is not set in bitrise.yml
    Then the Step will have Always latest and the latest version number, displayed under its title

  Scenario: Step's version is latest due to being set to the latest in bitrise.yml
    Given a Step's version is set to the latest in bitrise.yml
    Then the Step will have the latest version number displayed under its title

  Scenario: Step's version is an older one
    Given a Step's version is set to an older one in bitrise.yml
    Then the Step will have that older version number displayed under its title, in a red box
    And in the Step icon's corner, there will be a bubble indicating that the Step is not on the latest version

  Scenario: Step is verified due to source not being set, and Bitrise Steplib being the library
    Given a Step does not have source URL set in bitrise.yml
    And the library is Bitrise Steplib in bitrise.yml
    Then the Step will have the green verified badge next to its name

  Scenario: Step is verified due to source being set to the Bitrise Steplib
    Given a Step has the Bitrise Steplib set as the source URL in bitrise.yml
    Then the Step will have the green verified badge next to its name

  Scenario: Step is community created due to source not being set, and the library being custom
    Given a Step does not have source URL set in bitrise.yml
    And the library is a custom URL in bitrise.yml
    Then the Step will have the purple community created badge next to its name

  Scenario: Step is community created due to source being custom
    Given a Step has a custom library set as the source URL in bitrise.yml
    Then the Step will have the purple community badge next to its name

  Scenario: Step is deprecated due to having deprecation notes in its library
    Given a Step has deprecation notes in its library
    Then the Step will have the red deprecated badge next to its name

  Scenario: Step has icon due to being set in its library
    Given a Step has an icon URL set in its library
    Then the Step will have that icon displayed

  Scenario: Step has icon due to being set in bitrise.yml
    Given a Step has an icon URL set in its config in bitrise.yml
    Then the Step will have that icon displayed

  Scenario: Step does not have icon set
    Given a Step does not have icon set in its library, nor in its config in bitrise.yml
    Then the Step will have the default Step icon displayed

  Scenario: User selects a Step
    When User selects a Step of the _setup Workflow
    Then the _setup Workflow will be the selected Workflow in the chain
    And the editor will scroll to the top of the _setup Workflow
    And details of the Step will appear in the section of the _setup Workflow

  Scenario: User clicks outside the selected Step's entry & main box
    Given a Step of the _setup Workflow is selected
    When User clicks outside the Step's entry & main box
    Then the Step will be deselected
    But the Workflow will remain the selected one in the chain

  Scenario: User updates Step by selecting its older version indicator bubble
    Given a Step is on an older version
    When User selects the bubble indicating that the Step is on an older version
    Then the Step will be updated to the latest version
    But not being set to Always latest
    And Step will be selected
