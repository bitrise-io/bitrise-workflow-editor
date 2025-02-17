(function () {
  angular.module('BitriseWorkflowEditor').service('dateService', function ($filter) {
    const dateService = {
      defaultSaveDelayDurationInMilliseconds: 1000,
    };

    dateService.datetimeValueFromDate = function (date) {
      if (!date) {
        return date;
      }

      return $filter('date')(date, 'yyyy-MM-dd HH:mm:ss');
    };

    dateService.ISODateStringFromString = (dateString) => {
      if (!dateString || typeof dateString !== 'string') {
        return dateString;
      }

      // eslint-disable-next-line react/destructuring-assignment
      const [date, time] = dateString.split(' ');
      if (date && time) {
        return `${date}T${time}Z`;
      }

      if (date) {
        return date;
      }

      return null;
    };

    dateService.dateFromString = function (string) {
      const dateString = dateService.ISODateStringFromString(string);

      if (!dateString) {
        return dateString;
      }

      return new Date(dateString);
    };

    dateService.isDateExpired = function (date) {
      if (!date) {
        return undefined;
      }

      const now = new Date();

      return date < now;
    };

    dateService.toLocaleMonthDayDateString = function (string) {
      const date = new Date(string);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();

      const nthNumber = (n) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
          case 1:
            return 'st';
          case 2:
            return 'nd';
          case 3:
            return 'rd';
          default:
            return 'th';
        }
      };

      return `${day}${nthNumber(day)} of ${month}`;
    };

    return dateService;
  });

  angular.module('BitriseWorkflowEditor').filter('datetimeValue', function (dateService) {
    return dateService.datetimeValueFromDate;
  });
})();
