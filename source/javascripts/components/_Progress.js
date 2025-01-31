(function () {
  angular.module('BitriseWorkflowEditor').factory('Progress', function () {
    const Progress = function () {
      this.statusMessage = undefined;
      this.isInProgress = undefined;
      this.isError = undefined;
      this.isIdle = undefined;
      this.cssClass = undefined;

      this.reset();
    };

    Progress.prototype.start = function (statusMessage) {
      this.statusMessage = statusMessage;
      this.isIdle = false;
      this.isInProgress = true;
      this.isError = false;
      this.cssClass = 'in-progress';
    };

    Progress.prototype.error = function (error) {
      this.statusMessage =
        error.message !== 'Split configuration requires an Enterprise plan'
          ? error.message
          : `<h2><strong>${error.message}</strong></h2> Contact our customer support if you'd like to try it out. <a href='https://bitrise.io/contact' target='_blank'><u>Contact us</u></a>`;
      this.isIdle = false;
      this.isInProgress = false;
      this.isError = true;
      this.cssClass = 'error';
    };

    Progress.prototype.success = function (statusMessage) {
      if (statusMessage === undefined) {
        return this.reset();
      }

      this.statusMessage = statusMessage;
      this.isIdle = true;
      this.isInProgress = false;
      this.isError = false;
      this.cssClass = 'success';
    };

    Progress.prototype.reset = function (statusMessage) {
      this.statusMessage = null;
      this.isIdle = true;
      this.isInProgress = false;
      this.isError = false;
      this.cssClass = null;
    };

    return Progress;
  });

  angular.module('BitriseWorkflowEditor').directive('progressModel', function () {
    return {
      restrict: 'A',
      replace: true,
      template(tElement, tAttrs) {
        let progressNgIfValue = tAttrs.progressNgIf;
        if (!progressNgIfValue) {
          progressNgIfValue = 'true';
        }

        const ngIfValue = `(${progressNgIfValue}) && (${tAttrs.progressModel}.statusMessage.length > 0)`;

        tElement.attr('ng-if', ngIfValue);
        tElement.attr('ng-class', `${tAttrs.progressModel}.cssClass`);

        if (tElement.children().length > 0) {
          let inProgressContentElement = tElement.find('.in-progress-content');
          let errorContentElement = tElement.find('.error-content');

          if (inProgressContentElement.length === 0) {
            inProgressContentElement = angular.element(
              `<span class='in-progress-content' ng-bind-html='${tAttrs.progressModel}.statusMessage'></span>`,
            );
            tElement.append(inProgressContentElement);
          }
          inProgressContentElement.attr('ng-if', `${tAttrs.progressModel}.isInProgress`);

          if (errorContentElement.length === 0) {
            errorContentElement = angular.element(
              `<span class='error-content' ng-bind-html='${tAttrs.progressModel}.statusMessage'></span>`,
            );
            tElement.append(errorContentElement);
          }
          errorContentElement.attr('ng-if', `${tAttrs.progressModel}.isError`);
        } else {
          tElement.attr('ng-bind-html', `${tAttrs.progressModel}.statusMessage`);
        }

        tElement.attr('model', tAttrs.progressModel);
        tElement.removeAttr('progressModel');

        return tElement.prop('outerHTML');
      },
    };
  });
})();
