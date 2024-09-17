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
      And I click on "Step When to run group"
    Then "Selected Step First Input" should "be visible"
    Then "Selected Step First Input Variable Button" should "be visible"
    When I click on "Selected Step First Input Variable Button"
    Then "Dialog" should "be visible"
      And I should see "Insert variable" in "Dialog Header"

  Scenario: User changes Input text value
    When I click on "Second step"
      And I click on "Step When to run group"
      And I click on "Selected Step First Input"
    And I clear "Selected Step First Input"
    And I type "whatever" in "Selected Step First Input"
    Then "Selected Step First Input" should "have value:whatever"

  Scenario: Sensitive Input
    When I click on "First step"
    Then I should see "GitHub auth token" in "First Sensitive Form Control Label"
    Then "First Sensitive Form Control Badge" should "be visible"

  Scenario: Required Input
    When I click on "First step"
    Then I should see "GitHub auth token" in "First Sensitive Form Control Label"
      And I should not see "optional" in "First Sensitive Form Control Label"
      And "First Sensitive Form Control Badge" should "be visible"

  Scenario: Inserting Variable into a selected place
    Given "wf5" workflow is selected
    And "First" step is selected
    When I click on "First Input"
      And I blur "First Input"
      And I click on "First Insert Variable Button"
    Then "First variable for insert" should "be visible"
    Then I click on "First variable for insert"
      And I click on "Insert Selected Variable Button"
    Then "First Input" should "have value:#!/usr/bin/env bash$BITRISE_SOURCE_DIR"


  Scenario: Inserting Variable into a selected space
    Given "wf5" workflow is selected
      And "First" step is selected
    When I click on "First Input"
      And Highlight all text in "First Input"
      And I click on "First Insert Variable Button"
      And I click on "First variable for insert"
      And I click on "Insert Selected Variable Button"
    Then "First Input" should "have value:$BITRISE_SOURCE_DIR"
      And "Dialog" should "not exist"

  Scenario: Insert Variable popup's Variable list
    Given "wf3" workflow is selected
      And "Third" step is selected
      And I click on "First Insert Variable Button"
    Then "Insert variable element called BITRISE_SOURCE_DIR" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_SOURCE_DIR"
      And "Insert variable element called BITRISE_DEPLOY_DIR" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_DEPLOY_DIR"
      And "Insert variable element called BITRISE_BUILD_STATUS" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_BUILD_STATUS"
      And "Insert variable element called BITRISE_TRIGGERED_WORKFLOW_ID" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_TRIGGERED_WORKFLOW_ID"
      And "Insert variable element called BITRISE_TRIGGERED_WORKFLOW_TITLE" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called BITRISE_TRIGGERED_WORKFLOW_TITLE"
      And "Insert variable element called CI" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called CI"
      And "Insert variable element called PR" should "exist"
      And I should see "from bitrise CLI" in "Insert variable element called PR"
      And "Insert variable element called VERYSECRET" should "exist"
      And I should see "from secrets" in "Insert variable element called VERYSECRET"
      And "Insert variable element called ACCESS_KEY" should "exist"
      And I should see "from app env vars" in "Insert variable element called ACCESS_KEY"

  Scenario: Insert Variable popup's filter
    Given "wf3" workflow is selected
      And "Third" step is selected
      And I click on "First Insert Variable Button"
    When I type "proj" in "Variable Filter Input"
      Then "Insert variable element called project" should "be visible"
      And I should see "env var of workflow: wf4" in "Insert variable element called project"
