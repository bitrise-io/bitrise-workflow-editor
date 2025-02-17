angular.module('BitriseWorkflowEditor').filter('replace', [
  'stringService',
  function (stringService) {
    return stringService.stringReplacedWithParameters;
  },
]);
