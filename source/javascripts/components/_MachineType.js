(function () {
  angular.module('BitriseWorkflowEditor').factory('MachineType', function ($q, requestService) {
    const MachineType = function (
      stackType,
      id,
      name,
      cpuCount,
      cpuDescription,
      ram,
      creditPerMin,
      isAvailable,
      note,
      tag,
      type,
      chip,
      availableOnStacks,
    ) {
      this.id = id;
      this.name = name;
      this.cpuCount = cpuCount;
      this.cpuDescription = cpuDescription;
      this.creditPerMin = creditPerMin;
      this.ram = ram;
      this.stackType = stackType;
      this.isAvailable = isAvailable;
      this.note = note;
      this.tag = tag;
      this.chip = chip;
      this.cssClass = type;
      this.availableOnStacks = availableOnStacks;
    };

    MachineType.all = undefined;
    MachineType.defaults = undefined;

    MachineType.getAll = function () {
      if (MachineType.all) {
        return $q.when();
      }

      return requestService.getMachineTypeConfigs().then(function (data) {
        MachineType.all = [];
        MachineType.defaults = {};

        _.each(data.machineTypeConfigs, function (aMachineTypeConfig, aStackType) {
          _.each(aMachineTypeConfig.machine_types, function (aMachineTypeDetails, aMachineTypeID) {
            const machineType = new MachineType(
              aStackType,
              aMachineTypeID,
              aMachineTypeDetails.name,
              aMachineTypeDetails.cpu_count,
              aMachineTypeDetails.cpu_description,
              aMachineTypeDetails.ram,
              aMachineTypeDetails.credit_per_min,
              aMachineTypeDetails.is_available,
              aMachineTypeDetails.note,
              aMachineTypeDetails.tag,
              aMachineTypeDetails.type,
              aMachineTypeDetails.chip,
              aMachineTypeDetails.available_on_stacks,
            );

            if (aMachineTypeConfig.default_machine_type === aMachineTypeID) {
              MachineType.defaults[aStackType] = machineType;
            }

            MachineType.all.push(machineType);
          });
        });

        MachineType.all = _.sortBy(MachineType.all, function (machineType) {
          const categories = ['intel', 'm1', 'm1-max', 'm2', 'other'];
          let category = 'other';
          if (machineType.chip === 'intel') {
            category = 'intel';
          } else if (machineType.id.includes('m1')) {
            if (machineType.id.includes('max')) {
              category = 'm1-max';
            } else {
              category = 'm1';
            }
          } else if (machineType.id.startsWith('g2.mac.')) {
            category = 'm2';
          }

          return [categories.indexOf(category), machineType.creditPerMin];
        });
      });
    };

    return MachineType;
  });
})();
