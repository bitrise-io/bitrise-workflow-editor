Feature: Workflow steps inputs

  The selected Step's Inputs' properties can be viewed & some of them can be edited.

  Background:
    Given workflows tab is open

  Scenario: Step's selected
    When I click on "First step"
    Then I should see "GitHub Status" in "Step Title"
    Then I should see "2.4.0" in "Step Version"
      And "Step Version Details" should "be visible"
      And "Save Button" should "be disabled"

  Scenario: Inputs without categories don't get wrapped into expandable container
    When I click on "First step"
      And I scroll "Step edit container" to 100px
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
    Then "Selected Step Second Input Category Inputs" should "not exist"

  Scenario: A changeable Input
    When I click on "First step"
      And I click on "Selected Step First Input"
    Then "Selected Input Insert Variable Button" should "be visible"
    When I click on "Selected Input Insert Variable Button"
    Then "Insert Variable Popup" should "be visible"

  Scenario: Input in non-edit mode
    When I click on "First step"
      And I scroll "Step edit container" to 100px
    Then "Selected Step First Input Change Button" should "be visible"

  Scenario: User changes Input text value
    When I click on "Second step"
      And I click on "Selected Step First Input"
    Then "Selected Step First Input Description" should "be visible"
    When I click on "Selected Input Textarea"
      And I clear "Selected Input Textarea"
      And I type "whatever" in "Selected Input Textarea"
    Then "Selected Input Textarea" should "have value:whatever"

  Scenario: Sensitive Input
    When I click on "First step"
      And I scroll "Step edit container" to 100px
    Then I should see "GitHub auth token" in "Selected Step First Input Title"
    Then "Selected Step First Input Sensitive Badge" should "be visible"
    When I click on "Selected Step First Input"
    Then "Selected Input Clear Button" should "be visible"

  Scenario: Clearing the sensitive Input's value
    When I click on "First step"
      And I click on "Selected Step First Input"
    When I click on "Selected Input Clear Button"
    Then "Selected Input Textarea" should "be empty"
    Then "Selected Input Clear Button" should "not exist"

  Scenario: Required Input
    When I click on "First step"
      And I scroll "Step edit container" to 100px
    Then I should see "GitHub auth token" in "Selected Step First Input Title"
      And "Selected Step First Input Required Badge" should "be visible"
    When I click on "Selected Step First Input"
      And I click on "Selected Input Clear Button"
    Then "Selected Input Textarea" should "be empty"
      And "Selected Input Textarea" should have "red" "border-color" style

  Scenario: Inserting Variable into a selected place
    Given "wf5" workflow is selected
      And "First" step is selected
    When I click on "Selected Step First Input"
      And I click on "Selected Input Textarea"
      And I click on "Selected Input Insert Variable Button"
      And I click on "First variable for insert"
    Then "Selected Input Textarea" should "have value:#!/usr/bin/env bash$BITRISE_SOURCE_DIR"


  Scenario: Inserting Variable into a selected space
    Given "wf5" workflow is selected
      And "First" step is selected
    When I click on "Selected Step First Input"
      And I click on "Selected Input Textarea"
      And Highlight all text in "Selected Input Textarea"
      And I click on "Selected Input Insert Variable Button"
      And I click on "First variable for insert"
    Then "Selected Input Textarea" should "have value:$BITRISE_SOURCE_DIR"
      And "Insert Variable Popup" should "not be visible"

  Scenario: Insert Variable popup's Variable list
    Given "wf3" workflow is selected
      And "Third" step is selected
      And Insert Variable popup is open
    Then "Insert variable element called BITRISE_SOURCE_DIR" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_SOURCE_DIR source"
      And "Insert variable element called BITRISE_DEPLOY_DIR" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_DEPLOY_DIR source"
      And "Insert variable element called BITRISE_BUILD_STATUS" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_BUILD_STATUS source"
      And "Insert variable element called BITRISE_TRIGGERED_WORKFLOW_ID" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_TRIGGERED_WORKFLOW_ID source"
      And "Insert variable element called BITRISE_TRIGGERED_WORKFLOW_TITLE" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_TRIGGERED_WORKFLOW_TITLE source"
      And "Insert variable element called CI" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called CI source"
      And "Insert variable element called PR" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called PR source"
      And "Insert variable element called VERYSECRET" should "exist"
      And I should see "from secrets" in "Insert variable element called VERYSECRET source"
      And "Insert variable element called ACCESS_KEY" should "exist"
      And I should see "from app env vars" in "Insert variable element called ACCESS_KEY source"
      And "Insert variable element called GITHUB_TOKEN" should "exist"
      And I should see "from app env vars" in "Insert variable element called GITHUB_TOKEN source"
      And "Insert variable element called SLACK_WEBHOOK" should "exist"
      And I should see "from app env vars" in "Insert variable element called SLACK_WEBHOOK source"
      And "Insert variable element called COMPANY_NAME" should "exist"
      And I should see "output of step: A local step" in "Insert variable element called COMPANY_NAME source"
      And "Insert variable element called project" should "exist"
      And I should see "env var of workflow: wf3" in "Insert variable element called project source"

  Scenario: Insert Variable popup's filter
    Given "wf3" workflow is selected
      And "Third" step is selected
      And Insert Variable popup is open
    When I type "proj" in "Insert variable filter field"
    Then "Variables for insert" should contain 1 "li"
