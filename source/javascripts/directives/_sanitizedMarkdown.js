(function () {
  angular.module('BitriseWorkflowEditor').directive('sanitizedMarkdown', function ($sanitize, $showdown) {
    return {
      restrict: 'AE',
      template: '<div ng-bind-html="sanitizedMarkdownHtml"></div>',
      link(scope, element, attrs) {
        if (attrs.sanitizedMarkdown) {
          scope.$watch(attrs.sanitizedMarkdown, function (newValue) {
            if (newValue) {
              scope.sanitizedMarkdownHtml = getSanitizedHtml(newValue);
            }
          });
        }

        function getSanitizedHtml(markdown) {
          const strippedHTML = $showdown.stripHtml(markdown);
          const html = $showdown.makeHtml(strippedHTML);
          return html;
        }
      },
    };
  });
})();
