(function () {
  angular.module('BitriseWorkflowEditor').service('dateService', function () {
    const dateService = {
      defaultSaveDelayDurationInMilliseconds: 1000,
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
})();
