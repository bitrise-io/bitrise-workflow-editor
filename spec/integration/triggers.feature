Feature: triggers

  Creating triggers, editing source and target branches, changing workflows,
  reordering triggers, switching between trigger types should be possible.

  Background:
    Given triggers tab is open

  Scenario: Clicking through filters
    When I click on "Tag filter"
    Then I should see 0 triggers
    When I click on "Pull Request filter"
    Then I should see a trigger
    When I click on "Push filter"
    Then I should see 2 triggers

  Scenario: Create trigger but remove it on Cancel click
    When I click on "Tag filter"
    Then I should see 0 triggers
      And "Save Button" should "be disabled"
    When I click on "Add trigger button"
    Then I should see a trigger
      And "Save Button" should "not be disabled"
      And "Add trigger button" should "be disabled"
    When I click on "Trigger cancel"
    Then I should see 0 triggers
      And "Save Button" should "be disabled"

  Scenario: Create trigger and stop editing on clicking Done
    When I click on "Tag filter"
    Then I should see 0 triggers
      And "Save Button" should "be disabled"
    When I click on "Add trigger button"
    Then I should see a trigger
      And "Save Button" should "not be disabled"
      And "Add trigger button" should "be disabled"
    When I click on "Trigger done"
    Then I should see a trigger
      And "Save Button" should "not be disabled"
      And "First trigger" should not be editable

  Scenario: Trigger should be editable after clicking it
    When I click on "Push filter"
    Then I click on "First trigger"
      And "First trigger" should be editable
    When I clear "First trigger pattern"
      And I type "feature/*" in "First trigger pattern"
      And I select "wf5" from "First trigger workflow"
      And I click on "Trigger done"
    Then "First trigger" should not be editable
      And I should see "feature/*" in "First trigger pattern"
      And I should see "wf5" in "First trigger workflow"

  Scenario: Reordering triggers by dragging
    When I click on "Push filter"
    Then I should see "wf1" in "First trigger workflow"
    When I drag "First trigger" down
    Then I should see "wf2" in "First trigger workflow"

  Scenario: Trigger should be removed on clicking Delete
    When I click on "Push filter"
    Then I should see 2 triggers
      And "Save Button" should "be disabled"
    When I click on "First trigger delete"
    Then I should see a trigger
      And "Save Button" should "not be disabled"

  Scenario: Show no triggers added warning when all triggers are deleted
    When I click on "First trigger delete"
    And I click on "First trigger delete"
    Then I click on "Pull Request filter"
    And I click on "First trigger delete"
    Then I should see the tigger warning notification