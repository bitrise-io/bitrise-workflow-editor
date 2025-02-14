(function () {
  angular.module('BitriseWorkflowEditor').directive('floatingMenu', function ($parse) {
    return {
      restrict: 'A',
      link(scope, element, attrs) {
        function escapeKeyPressHandler(event) {
          if (event.keyCode !== 27) {
            return;
          }

          dismissFloatingMenu();
        }

        function clickHandler(event) {
          if (element === $(event.target) || element.find($(event.target)).length > 0) {
            return;
          }

          dismissFloatingMenu();
        }

        function dismissFloatingMenu() {
          $parse(attrs.toggle).assign(scope, false);
          scope.$apply();
        }

        scope.$watch(
          function () {
            return $parse(attrs.toggle)(scope);
          },
          function (value) {
            if (value === undefined || !value) {
              $(document).off('keyup', escapeKeyPressHandler);
              $(document).off('click', clickHandler);

              return;
            }

            $(document).on('keyup', escapeKeyPressHandler);
            $(document).on('click', clickHandler);
          },
        );

        scope.$on('$destroy', function () {
          $(document).off('keyup', escapeKeyPressHandler);
          $(document).off('click', clickHandler);
        });
      },
    };
  });
})();
