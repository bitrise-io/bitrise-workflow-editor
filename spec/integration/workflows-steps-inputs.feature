Feature: Workflow steps

    The selected Step's Inputs' properties can be viewed & some of them can be edited.

    Background:
        Given editor is open

    Scenario: Step's selected
        When I click on "First step"
        Then I should see "GitHub Status" in "Step Title"
        Then I should see "2.2.2" in "Step Version"
        And "Step Versions" should "be visible"
        And "Step Inputs" should "be visible"
        And I should see "Step's latest version is: 2.2.2" in "Step Versions"
        And "Save Button" should "be disabled"
