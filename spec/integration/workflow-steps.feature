 Feature: Workflow steps

  The selected Step's properties can be viewed & some of them can be edited.
  The selected Step's Inputs' properties can be viewed & some of them can be edited.
  Steps of any Workflow are listed, they can be selected, and their name, version, icon & badges are displayed.

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

  Scenario: Version Downgrade
    When I click on "First step"
    And I select "1.0.x" from "Version selector"
    And I confirm on "Alert popup"
    Then "First step version indicator" should "be visible"
    And I should see "Version: 1.0.4" in "Step Versions"
    And "Step Latest Version Updater" should "be visible"

  Scenario: Version Update
    When I click on "First step"
    And I select "2.x.x" from "Version selector"
    Then I should see "Version: 2.2.2" in "Step Versions"
    And "Step Version Success Icon" should "be visible"
    And "Save Button" should "not be disabled"

  Scenario: Latest Version Update
    When I click on "First step"
    And I select "1.0.x" from "Version selector"
    And I confirm on "Alert popup"
    And I click on "Step Latest Version Updater"
    Then I should see "Version: 2.2.2" in "Step Versions"
    And "Step Version Success Icon" should "be visible"

  Scenario: Always latest vs latest major lock
    When I click on "Third step"
    Then I should see "Version: 4.0.5" in "Step Version"
    When I select "4.x.x" from "Version selector"
    Then I should see "Version: 4.0.5" in "Step Versions"
