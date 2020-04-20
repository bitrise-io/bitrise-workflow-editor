Feature: Workflow Step details

  The selected Step's properties can be viewed & some of them can be edited.

  Background:
    Given there is Workflows called ci
    And it has a Step
    And the Step is selected

  Scenario: Deprecated badges display their category in a tooltip on hover
    Given the Step is deprecated
    When User hovers the green deprecated badge
    Then the phrase Deprecated shows up in a tooltip


  Scenario: Step without source code
    Given the Step does not have source code URL set
    Then there will be no source code button on the right

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

  Scenario: Green Step version indicator due to Step being on Always latest
    Given the Step has Always latest selected in the version dropdown
    Then a green circle is visible on the left of the version section

  Scenario: Green Step version indicator due to Step being on the latest version
    Given the Step has the latest version selected in the version dropdown
    Then a green circle is visible on the left of the version section

  Scenario: Red Step version indicator due to Step being on an older version
    Given the Step has an older version selected in the version dropdown
    Then a red circle is visible on the left of the version section

  Scenario: Warning message for Step from a library having an invalid version set
    Given the Step is from a library
    And its version is not in the library
    Then the Invalid version message will appear


  Scenario: User views versions of a Step from a git URL, in dropdown
    Given the Step is specified with a git URL
    When User selects the dropdown
    Then a single entry for the Step's version will be visible

  Scenario: There is no version section for Step with a local path
    Given the Step is from a local path
    Then there will be no version section


  Scenario: Inputs section is not displayed if Step has no Inputs
    Given the Step has no Inputs
    Then there is no Inputs section

  Scenario: Inputs section is displayed if Step has Inputs
    Given the Step has Inputs
    Then the Inputs section is visible
