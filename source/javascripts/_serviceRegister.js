import SemverService from "./services/semverservice";

angular
    .module("BitriseWorkflowEditor")
    .factory("semverService", function() { return new SemverService(); });
