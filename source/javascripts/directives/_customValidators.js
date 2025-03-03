(function () {
  angular.module('BitriseWorkflowEditor').directive('customValidators', function ($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link(scope, element, attrs, ngModel) {
        scope.$watch(
          function () {
            return ngModel.$modelValue;
          },
          function () {
            _.each($parse(attrs.customValidators)(scope), function (aValidator, validatorID) {
              ngModel.$setValidity(validatorID, aValidator);
            });
          },
        );
      },
    };
  });
})();
