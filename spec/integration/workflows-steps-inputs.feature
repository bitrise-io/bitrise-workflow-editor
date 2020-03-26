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
    Then I should see "Config" in "Selected Step Second Input Category Title"
    When I click on "Selected Step Second Input Category"
    Then "Selected Step Second Input Category Inputs" should "be visible"

  Scenario: Expanding and Closing Input categories' container
    When I click on "Second step"
    Then I should see "Config" in "Selected Step Second Input Category Title"
    When I click on "Selected Step Second Input Category"
    Then "Selected Step Second Input Category Inputs" should "be visible"
    When I click on "Selected Step Second Input Category Toggle Button"
    Then "Selected Step Second Input Category Inputs" should "not be visible"

  Scenario: A changeable Input
    When I click on "First step"
    And I click on "Selected Step First Input"
    Then "Selected Input Insert Variable Button" should "be visible"
    When I click on "Selected Input Insert Variable Button"
    Then "Insert Variable Popup" should "be visible"

  Scenario: Input in non-edit mode
    When I click on "First step"
    Then "Selected Step First Input Change Button" should "be visible"

  Scenario: User changes Input text value
    When I click on "Second step"
    And I click on "Selected Step First Input"
    Then "Selected Step First Input Description" should "be visible"
    And I click on "Selected Input Textarea"
    And I clear "Selected Input Textarea"
    And I type "whatever" in "Selected Input Textarea"
    Then "Selected Input Textarea" should "have value:whatever"

  Scenario: Sensitive Input
    When I click on "First step"
    Then I should see "GitHub auth token" in "Selected Step First Input Title"
    Then "Selected Step First Input Sensitive Badge" should "be visible"
    And I click on "Selected Step First Input"
    Then "Selected Input Clear Button" should "be visible"

  Scenario: Clearing the sensitive Input's value
    When I click on "First step"
    And I click on "Selected Step First Input"
    When I click on "Selected Input Clear Button"
    Then "Selected Input Textarea" should "be empty"
    Then "Selected Input Clear Button" should "not exist"

  Scenario: Required Input
    When I click on "First step"
    Then I should see "GitHub auth token" in "Selected Step First Input Title"
    And "Selected Step First Input Required Badge" should "be visible"
    When I click on "Selected Step First Input"
    And I click on "Selected Input Clear Button"
    Then "Selected Input Textarea" should "be empty"
    And "Selected Input Textarea" should have "purple" "border-color" style
