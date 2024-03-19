(function() {
  "use strict";

  angular.module("BitriseWorkflowEditor").service("osService", function() {
    var osService = {};

    osService.cssClass = function() {
      if (osService.isWindows()) {
        return "windows";
      }
      if (osService.isMac()) {
        return "osx";
      }
      return "other";
    };

    osService.isWindows = function() {
      return navigator.platform.toLowerCase().indexOf("win") != -1;
    };

    osService.isMac = function() {
      return navigator.platform.toLowerCase().indexOf("mac") != -1;
    };

    return osService;
  });
})();
