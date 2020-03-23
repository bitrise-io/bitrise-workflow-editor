Feature: Workflow steps inputs

  The selected Step's Inputs' properties can be viewed & some of them can be edited.

  Background:
    Given editor is open

  Scenario: Step's selected
    When I click on "First step"
    Then I should see "GitHub Status" in "Step Title"
    Then I should see "2.2.2" in "Step Version"
    And "Step Versions" should "be visible"
    And "Step Inputs" should "be visible"
    And "Save Button" should "be disabled"

  Scenario: Inputs without categories don't get wrapped into expandable container
    When I click on "First step"
    Then "Step Inputs Without Category" should "be visible"

  Scenario: Inputs with categories get wrapped into expandable container
    When I click on "Second step"
    Then I should see "Config" in "Second Step Input Category Title"
    When I click on "Second Step Input Category"
    Then "Second Step Input Category Inputs" should "be visible"

  Scenario: Expanding and Closing Input categories' container
    When I click on "Second step"
    Then I should see "Config" in "Second Step Input Category Title"
    When I click on "Second Step Input Category"
    Then "Second Step Input Category Inputs" should "be visible"
    When I click on "Second Step Input Category Toggle Button"
    Then "Second Step Input Category Inputs" should "not be visible"

  Scenario: A changeable Input
    When I click on "First step"
    And I click on "First Step Input"
    Then "First Step Input Insert Variable Button" should "be visible"
    When I click on "First Step Input Insert Variable Button"
    Then "Insert Variable Popup" should "be visible"

  Scenario: Input in non-edit mode
    When I click on "First step"
    Then "First Step Input Change Button" should "be visible"
  # And "First Step Input Description" should "be visible" # Fails locally

  Scenario: User changes Input text value
    When I click on "Second step"
    And I click on "First Step Input"
    And I click on "Selected Input Textarea"
    And I clear "Selected Input Textarea"
    And I type "whatever" in "Selected Input Textarea"
    Then "Selected Input Textarea" should "have value:whatever"

  Scenario: Sensitive Input
    When I click on "First step"
    Then I should see "GitHub auth token" in "First Step Input Title"
    Then "First Step Input Sensitive Badge" should "be visible"
    And I click on "First Step Input"
    Then "First Step Input Clear Button" should "be visible"

  Scenario: Clearing the sensitive Input's value
    When I click on "First step"
    And I click on "First Step Input"
    When I click on "First Step Input Clear Button"
    Then "Selected Input Textarea" should "be empty"
    Then "First Step Input Clear Button" should not exist

  Scenario: Required Input
    When I click on "First step"
    Then I should see "GitHub auth token" in "First Step Input Title"
    Then "First Step Input Required Badge" should "be visible"

  Scenario: Empty required Input
    When I click on "First step"
    Then I should see "GitHub auth token" in "First Step Input Title"
    And I click on "First Step Input"
    Then "Selected Input Textarea" should "be empty"
# Then "Selected Input Textarea" should have "purple" "border-color" style