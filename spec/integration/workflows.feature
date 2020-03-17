Feature: Workflows

  Adding a Workflow is possible by providing a name for it, and either starting out with an empty one, or as a duplication of a selectable existing one.

  Background:
    Given editor is open

  Scenario: Steps sidebar
    Then I should see "GitHub Status" in "First step"
      And I should see "Script" in "Second step"

  Scenario: User creates a Workflow
    When I click on "Add Workflow Button"
      And I select "Empty workflow" from "Base Workflow Dropdown"
      And I type "TestWorkflow" in "Workflow Name"
      And I click on "Workflow Add Button"
    Then "Workflow Add popup" should "not be visible"
      And Workflow appeared with name "Test"

  Scenario: Delete Workflow
    Given Workflow with name "ToBeDeleted"
    When I click on "Delete Workflow Button"
      And I confirm on "Default popup"
    Then I should not see "ToBeDeleted" in "Selected Workflow Name"
      And I should see "wf1" in "Selected Workflow Name"

  Scenario: User adds a before workflow
    When I click on "Add Before Workflow button"
      And I select "wf4" from "Before Workflow Dropdown"
      And I confirm on "Add Before Workflow popup"
    Then I should see "wf4" in "Before Workflow Name"

  Scenario: User cancels adding a before workflow
    When I click on "Add Before Workflow button"
      And I select "wf4" from "Before Workflow Dropdown"
      And I cancel on "Add Before Workflow popup"
    Then "Workflow Sections" should contain 1 "Workflow Section"

  Scenario: User adds a after workflow
    When I click on "Add After Workflow button"
      And I select "wf4" from "After Workflow Dropdown"
      And I confirm on "Add After Workflow popup"
    Then I should see "wf4" in "After Workflow Name"

  Scenario: User cancels adding an after workflow
    When I click on "Add After Workflow button"
      And I select "wf4" from "After Workflow Dropdown"
      And I cancel on "Add After Workflow popup"
    Then "Workflow Sections" should contain 1 "Workflow Section"

  Scenario: User creates a Workflow based on another workflow
    Given add workflow popup is open
    When I type "brand_new_wf" in "Workflow Name"
      And I select "wf4" from "Base Workflow Dropdown"
      And I confirm on "Workflow Add popup"
    Then "Workflow Add popup" should "not be visible"
      And I should see "brand_new_wf" in "Selected Workflow Name"
      And I should see "Script" in "First step name"

  Scenario: User selects a Workflow
    When I click on "Selected Workflow Name"
      And I click on "wf3 workflow"
    Then I should see "wf3" in "Selected Workflow Name"
      And I should see "wf4" in "First Before Workflow Name"
      And I should see "wf5" in "First After Workflow Name"
      And I should see "wf6" in "Last After Workflow Name"
      And "wf4 steps" should contain 1 "Step element"
      And "wf3 steps" should contain 3 "Step element"
      And "first wf5 steps" should contain 1 "Step element"
      And "wf6 steps" should contain 0 "Step element"
      And "Selected Workflow" should have "white" "background-color" style
    # And it has its stack displayed - WEBSITE MODE ONLY
      And I should see "The wf3 test workflow" in "Selected Workflow description"
      And "wf3 steps container" should contain 4 "Add Step element"
      And "Workflow Sections" should have "grey" "background-color" style
      And "wf4 Remove button" should "be visible"
      And "first wf5 Remove button" should "be visible"
      And "wf6 Remove button" should "be visible"
    # And they don't have their stack displayed  - WEBSITE MODE ONLY
      And "wf4 steps add step icons" should "not be visible"
      And "first wf5 steps add step icons" should "not be visible"
      And "wf6 steps container" should contain 1 "Add Step element"

  Scenario: User selects a duplicate Workflow in the chain
    Given "wf3" workflow is selected
    When I click on "wf4 workflow name"
    Then "wf4 workflow description" should "be visible"
      And "wf4 steps container" should contain 2 "Add Step element"
