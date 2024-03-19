(function() {
  "use strict";

  angular.module("BitriseWorkflowEditor").directive("sticky", function($parse) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        var parentElement = element.parent();
        var nextSiblingElement = element.next();
        var placeholderElement;

        function isSticking() {
          return (
            $("header.sticky [sticking-index='" + attrs.stickingIndex + "']")
              .length > 0
          );
        }

        function scrollHandler() {
          var shouldBeSticking =
            $(window).scrollTop() > element.parent().position().top &&
            !$parse(attrs.skipStickyness)(scope);

          if (shouldBeSticking) {
            if (!isSticking()) {
              stick();
            }
          } else {
            if (isSticking()) {
              unstick();
            }
          }
        }

        function stick() {
          placeholderElement = angular.element("<div></div>");
          placeholderElement.width(element.outerWidth());
          placeholderElement.height(element.outerHeight());

          $("header.sticky").append(element);

          if (nextSiblingElement.length == 0) {
            parentElement.append(placeholderElement);
          } else {
            placeholderElement.insertBefore(nextSiblingElement);
          }
        }

        function unstick() {
          placeholderElement.remove();
          if (nextSiblingElement.length == 0) {
            parentElement.append(element);
          } else {
            element.insertBefore(nextSiblingElement);
          }
        }

        $(window).on("scroll", scrollHandler);

        scope.$on("$destroy", function() {
          if (isSticking()) {
            unstick();
          }

          $(window).off("scroll", scrollHandler);
        });
      }
    };
  });
})();
