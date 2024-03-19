(function() {
  "use strict";

  angular
    .module("BitriseWorkflowEditor")
    .service("certificateService", function($filter) {
      var certificateService = {
        certificates: undefined,
        loadProgress: undefined
      };

      return certificateService;
    });
})();
