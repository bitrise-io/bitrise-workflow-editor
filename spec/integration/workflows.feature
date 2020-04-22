Feature: Workflows

  Adding a Workflow is possible by providing a name for it, and either starting out with an empty one, or as a duplication of a selectable existing one.

  Background:
    Given editor is open

  Scenario: Steps sidebar
    Then I should see "GitHub Status" in "First step"
      And I should see "Script" in "Second step"
    When I click on "First step"
    Then "First step" should "have class: selected"
      And all the steps are loaded

  Scenario: User creates a Workflow
    When I click on "Add Workflow Button"
      And I select "Empty workflow" from "Base Workflow Dropdown"
      And I type "TestWorkflow" in "Workflow Name"
      And I click on "Workflow Add Button"
    Then "Workflow Add popup" should "not be visible"
      And Workflow appeared with name "Test"

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
    When I select "wf3 workflow" from "Workflow selector"
    Then I should see "wf3" in "Selected Workflow Name"
      And I should see "wf4" in "First Before Workflow Name"
      And I should see "wf5" in "First After Workflow Name"
      And I should see "wf6" in "Last After Workflow Name"
      And "wf4 steps" should contain 5 "Step element"
      And "wf3 steps" should contain 3 "Step element"
      And "first wf5 steps" should contain 2 "Step element"
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
      And "wf4 steps container" should contain 6 "Add Step element"

  Scenario: User selects the delete button of an after run Workflow
    Given "wf3" workflow is selected
    When I click on "first wf5 Remove button"
    Then "Workflow Sections" should contain 4 "Workflow Section"
      And I should see "wf5" in "First After Workflow Name"
      And I should see "wf6" in "Last After Workflow Name"

  Scenario: Delete Workflow
    Given Workflow with name "ToBeDeleted"
    When I click on "Delete Workflow Button"
      And I confirm on "Default popup"
    Then I should not see "ToBeDeleted" in "Selected Workflow Name"
      And I should see "wf1" in "Selected Workflow Name"

  Scenario: User opens the Delete Workflow
    Given "wf3" workflow is selected
    When I click on "Delete Workflow Button"
    Then "Default popup" should "be visible"
      And I should see "Are you sure you want to delete the wf3 workflow?" in "Default popup message"

  Scenario: User confirms deleting a Workflow
    Given "wf6" workflow is selected
      And Delete popup is open
    When I confirm on "Default popup"
    Then "Default popup" should "not be visible"
      And I click on "Selected Workflow Name"
      And Workflow selector options should not contain "wf6"
      And I click on "wf3 workflow"
      And I should see "wf5" in "Last After Workflow Name"

  Scenario: User cancels deleting a Workflow
    Given "wf6" workflow is selected
      And Delete popup is open
    When I cancel on "Default popup"
    Then "Default popup" should "not be visible"
      And I click on "Selected Workflow Name"
      And "wf6 workflow" should "be visible"
      And I should see "wf6" in "Last After Workflow Name"

  Scenario: User opens the Workflow dropdown
    Given "wf3" workflow is selected
    When I click on "Selected Workflow Name"
    Then "wf1 workflow" should "be visible"
      And "wf2 workflow" should "be visible"
      And "wf3 workflow" should "be visible"
      And "wf4 workflow" should "be visible"
      And "wf5 workflow" should "be visible"
      And "wf6 workflow" should "be visible"
      And "wf3 workflow list element" should have "purple" "background-color" style
      And "wf3 workflow list element" should contain 1 "svg"
      And "wf3 workflow rename button" should "be visible"

  Scenario: User selects a Workflow from the Workflow dropdown
    Given the Workflow dropdown is open
    When I click on "wf3 workflow"
    Then I should see "wf3" in "Selected Workflow Name"

  Scenario: User selects rename for a Workflow in the Workflow dropdown
    Given "wf3" workflow is selected
      And the Workflow dropdown is open
    When I click on "wf3 workflow rename button"
    Then "wf3 workflow rename field" should "be visible"
      And "wf3 workflow rename field" should "be enabled"
      And "wf3 workflow rename submit" should "be visible"
      And "wf3 workflow rename submit" should "be enabled"

  Scenario: User confirms renaming a Workflow in the Workflow dropdown
    Given "wf3" workflow is selected
      And the Workflow dropdown is open
    When I click on "wf3 workflow rename button"
      And I clear "wf3 workflow rename field"
      And I type "my_new_wf_name" in "wf3 workflow rename field"
      And I click on "wf3 workflow rename submit"
    Then I should see "my_new_wf_name" in "Selected Workflow Name"
      And "my_new_wf_name workflow rename submit" should "not be visible"
      And "my_new_wf_name workflow rename submit" should "not be enabled"

  Scenario: User leaves the Workflow dropdown by clicking outside of it
    Given the Workflow dropdown is open
    When I click on "Selected Workflow Name"
      And I click away
    Then "Workflow selector dropdown" should "not be visible"
    When I click on "Selected Workflow Name"
      And I press "ESC"
    Then "Workflow selector dropdown" should "not be visible"
    When I click on "Selected Workflow Name"
      And I click on "Selected Workflow Name"
    Then "Workflow selector dropdown" should "not be visible"

  Scenario: User focuses to a Workflow's description box
    Given "wf3" workflow is selected
    When I click on "Selected Workflow description button"
    Then "Selected Workflow description container" should "have class: edit-mode"

  Scenario: User updates a Workflow's description
    Given "wf3" workflow is selected
      And Workflow description is in edit mode
    When I clear "Selected Workflow description textarea"
      And I type "Changed description" in "Selected Workflow description textarea"
      And I click away
    Then I should see "Changed description" in "Selected Workflow description"
      And "Selected Workflow description container" should "not have class: edit-mode"

  Scenario: User opens the Rearrange
    Given "wf3" workflow is selected
    When I click on "Rearrange button"
    Then "Rearrange popup" should "be visible"
      And "Workflow chain before workflows" should contain 1 "li"
      And "Workflow chain after workflows" should contain 3 "li"
      And "Workflow chain before wf4 workflow" should "contain: wf4"
      And I should see "wf5" in "Workflow chain first after wf5 workflow"
      And I should see "wf5" in "Workflow chain second after wf5 workflow"
      And I should see "wf6" in "Workflow chain after wf6 workflow"

