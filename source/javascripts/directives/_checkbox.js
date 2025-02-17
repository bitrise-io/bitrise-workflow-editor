(function () {
  angular.module('BitriseWorkflowEditor').directive('checkbox', function () {
    const inheritedAttributes = ['ng-model', 'ng-model-options', 'ng-change', 'ng-checked', 'ng-disabled'];

    return {
      restrict: 'E',
      replace: true,
      transclude: false,
      priority: 1000000,
      template(tElement, tAttrs) {
        const parentElement = angular.element('<div></div>');
        $(parentElement).addClass('checkbox');

        const inputCheckboxElement = angular.element("<input type='checkbox'></input>");
        _.each(inheritedAttributes, function (anAttribute) {
          inputCheckboxElement.attr(anAttribute, tElement.attr(anAttribute));
        });
        inputCheckboxElement.attr('id', `{{${tAttrs.checkboxIdExpression}}}`);

        $(parentElement).append(inputCheckboxElement);

        const checkboxSVGWrapperElement = angular.element('<div></div>');
        $(checkboxSVGWrapperElement).addClass('checkbox-svg-wrapper');
        $(parentElement).append(checkboxSVGWrapperElement);

        const checkElement = angular.element(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z"/></svg>',
        );
        $(checkElement).attr('check', '');
        $(checkboxSVGWrapperElement).append(checkElement);

        const crossElement = angular.element(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.4l-1.4-1.4-5.6 5.6-5.6-5.6-1.4 1.4 5.6 5.6-5.6 5.6 1.4 1.4 5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z"/></svg>',
        );
        $(crossElement).attr('cross', '');
        $(checkboxSVGWrapperElement).append(crossElement);

        return parentElement.prop('outerHTML');
      },
      link(scope, element) {
        _.each(inheritedAttributes, function (anAttribute) {
          $(element).removeAttr(anAttribute);
        });
      },
    };
  });
})();
