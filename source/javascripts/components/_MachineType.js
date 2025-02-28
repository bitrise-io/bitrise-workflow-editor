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

        function getCategory(machine) {
          if (machine.chip === 'intel') {
            return 'intel';
          } else if (machine.id.includes('m1')) {
            if (machine.id.includes('max')) {
              return 'm1-max';
            } else {
              return 'm1';
            }
          } else if (machine.id.startsWith('g2.mac.')) {
            return 'm2';
          }
          return 'other';
        }

        function getCpuCountNumber(cpuCount) {
          const match = cpuCount.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        }

        const sortedMachines = MachineType.all.sort((a, b) => {
          const creditComparison = a.creditPerMin - b.creditPerMin;
          if (creditComparison !== 0) {
            return creditComparison;
          }

          const cpuCountA = getCpuCountNumber(a.cpuCount);
          const cpuCountB = getCpuCountNumber(b.cpuCount);
          return cpuCountA - cpuCountB;
        });

        MachineType.all = sortedMachines.map(machine => ({
          ...machine,
          category: getCategory(machine)
        }));
      });
    };

    return MachineType;
  });
})();
