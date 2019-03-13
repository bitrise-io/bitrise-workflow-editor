(function() {
  'use strict';

  angular
    .module('BitriseWorkflowEditor')
    .directive('sanitizedMarkdown', function($sanitize, $showdown, $compile, $filter) {
      return {
        restrict: 'AE',
        template: '<div ng-bind-html="sanitizedMarkdownHtml"></div>',
        link: function(scope, element, attrs) {
          if (attrs.sanitizedMarkdown) {
            scope.$watch(attrs.sanitizedMarkdown, function(newValue) {
              if (newValue) {
                scope.sanitizedMarkdownHtml = getSanitizedHtml(newValue);
              }
            });
          }

          function getSanitizedHtml(markdown) {
            var strippedHTML = $showdown.stripHtml(markdown);
            var html = $showdown.makeHtml(strippedHTML);
            return html;
          }
        }
      };
    });
})();
