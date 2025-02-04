(function () {
  angular.module('BitriseWorkflowEditor').directive('select', function ($interpolate) {
    return {
      restrict: 'E',
      require: 'ngModel',
      link(scope, element, attrs) {
        if (attrs.noPlaceholder === '') {
          return;
        }

        scope.placeholderText = attrs.placeholder || 'Please select...';

        const placeholderOption = "<option value='' disabled>{{ placeholderText }}</option>";

        element.prepend($interpolate(placeholderOption)(scope));
      },
    };
  });
})();
