Feature: Workflow Step Inputs

  The selected Step's Inputs' properties can be viewed & some of them can be edited.

  Background:
    Given there is Workflows called ci
    And it has a Step
    And the Step has an Input
    And the Step is selected

  Scenario Outline: Input with custom opts
    Given the Input has a default <opt> in opts, in its default config
    But a custom <opt> is provided in opts, in bitrise.yml
    Then the Input's custom <opt> will be used instead of the default one

    Examples:
      | opt                   |
      | title                 |
      | category              |
      | summary               |
      | description           |
      | is don't change value |
      | is expand             |
      | is required           |
      | is sensitive          |

  Scenario: User changes Input dropdown value
    Given Input is in edit mode
    And Input has the value options opt defined with some selectable values
    When User chooses a different option from the dropdown
    Then the Input's value will be updated to that

  Scenario: Environment Variables will be replaced for Inputs with such option enabled
    Given Input is in edit mode
    And the Input has the is expand opt set to true
    Then the Environment Variables will be replaced... message will be displayed
    And during builds, all Environment Variables in the Input's value, will be replaced by their values

  Scenario: Environment Variables will be replaced for Inputs with such option disabled
    Given Input is in edit mode
    And the Input has the is expand opt set to false
    Then the Environment Variables won't be replaced... message will be displayed
    And during builds, all Environment Variables in the Input's value, will be unaltered

  Scenario: Sensitive Input with text field
    Given Input is sensitive
    And Input does not have the value options opt defined
    Then a message appears about it being sensitive
    And a link to the Secrets tab
    And a Select Secret Variable button

  Scenario: Selecting sensitive Input's text field
    Given Input is sensitive
    And Input does not have the value options opt defined
    When User selects its field
    Then the not allowed cursor is displayed
    And the Insert Variable popup appears, in secret-only mode

  Scenario: Inserting Variable into a selected place
    When User puts cursor in a selected place in the Input's field
    And User inserts Variable
    Then the Variable will be inserted at the place the cursor was in the field

  Scenario: Inserting Variable into a selected space
    When User selects a couple of characters in the Input's field
    And User inserts Variable
    Then the Variable will replace those couple of characters in the field

  Scenario: Insert Variable popup's Variable list
    Given the Insert Variable popup is open
    And app has uploaded code signing files
    And has Secrets
    And has App Environment Variables
    And the Workflow has before run Workflows
    And they have Workflow Environment Variables
    And they have Steps with Output Variables
    And the Workflow itself has Workflow Environment Variable
    And has previous Steps with Output Variables
    Then some default Variables
    And code signing files related Variables
    And Secrets
    And App Environment Variables
    And each before run Workflow's Environment Variables & Step Output Variables (in order, grouped by the Workflows)
    And the Workflow's Environment Variables
    And the previous Steps' Output Variables are listed
    And each have a subtext indicating their source

  Scenario: Insert Variable popup's filter
    Given the Insert Variable popup is open
    And it has a few Variables
    When User enters a phrase in the filter field
    Then only Variables which contain the entered phrase, will be visible

  Scenario: Selecting a Variable of the Insert Variable popup's list
    Given the Insert Variable popup is open
    And it has a few Variables
    When User selects a Variable
    Then the Insert Variable popup closes
    And the Variable is inserted in the target place

  Scenario: Insert Variable popup's secret-only mode
    Given the Insert Variable popup is open in secret-only mode
    And app has uploaded code signing files
    And has Secrets
    Then the create Secret section is visible
    And code signing realted Variables
    And Secrets are listed
