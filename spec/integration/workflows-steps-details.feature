Feature: Workflow steps details

  The selected Step's properties can be viewed & some of them can be edited.
  Steps of any Workflow are listed, they can be selected, and their name, version, icon & badges are displayed.

  Background:
    Given workflows tab is open

  Scenario: Always latest vs latest major lock
    When I click on "Third step"
    Then I should see "Version: 4.0.5" in "Step Version"
      And I should see "Always latest" in "Third StepItem Version"
    When I select "4.x.x" from "Step Version Selector"
    Then I should see "Version: 4.0.5" in "Step Version"
      And I should see "4.x.x" in "Third StepItem Version"

  Scenario: Step with always run capabilities
    Given "wf4" workflow is selected
    When I click on "Third step"
    Then I should see "A local step with overwritten summary" in "Step Description"
      And "Step Always run indicator" should "be checked"
    When I click on "Step Description Toggle"
    Then I should see "This local step has its description overwritten" in "Step Description"
    When I click on "Fourth step"
    Then "Step Always run indicator" should "not be checked"
    When I check "Step Always run indicator"
    Then "Discard Button" should "be enabled"
    When I uncheck "Step Always run indicator"
    Then "Discard Button" should "be disabled"

  Scenario: Steps badges: official, community, verified, deprecation
    Given "wf5" workflow is selected
    When I click away
    Given First step is selected
    Then I should see "Script" in "First step"
      And "Official Maintianer Badge" in "First step" should have attribute "title" with value "Bitrise step"
    When I click on "Second step"
    Then "Deprecated Maintianer Badge" should "be visible"

  Scenario: User deletes the Step
    When I click on "First step"
      And I click on "Step Delete Button"
    Then I should not see "GitHub Status" in "First step"
      And I should see "Script" in "First step"
      And no step selected
    When I click on "Second step"
      And I click on "Step Delete Icon"
    Then I should not see "Activate SSH key (RSA private key)" in "Second step"
      And no step selected

  Scenario: User clones Step
    Given "wf5" workflow is selected
      And First step is selected
    When I click on "Step clone button"
    Then I should see "Script" in "Second step"

  Scenario: User visits the source code of a Step having one
    Given "wf5" workflow is selected
      And First step is selected
    Then "Step source link" should have attribute "target" with value "_blank"
