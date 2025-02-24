import StringService from './services/string-service';
import RequestService from './services/request-service';
import loggerFactory from './services/logger';

angular
  .module('BitriseWorkflowEditor')
  .factory('logger', [
    'SERVICE_NAME',
    'DATADOG_API_KEY',
    'IS_ANALYTICS',
    function (serviceName, token, isAnalyticsOn) {
      return loggerFactory({
        name: serviceName,
        isAnalyticsOn,
        clientToken: token,
        level: 'info',
      });
    },
  ])
  .factory('StringService', function () {
    return StringService;
  })
  .factory('RequestService', function (logger) {
    return new RequestService(logger);
  });
