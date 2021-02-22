(function() {
	"use strict";

	angular
		.module("BitriseWorkflowEditor")
		.factory("MachineType", function($q, requestService) {
			var MachineType = function(
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
				availableOnStacks
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
				this.cssClass = type;
				this.availableOnStacks = availableOnStacks;
			};

			MachineType.all;
			MachineType.defaults;

			MachineType.getAll = function() {
				if (MachineType.all) {
					return $q.when();
				}

				return requestService.getMachineTypeConfigs().then(function(data) {
					MachineType.all = [];
					MachineType.defaults = {};

					_.each(data.machineTypeConfigs, function(aMachineTypeConfig, aStackType) {
						_.each(aMachineTypeConfig.machine_types, function(aMachineTypeDetails, aMachineTypeID) {
							var machineType = new MachineType(
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
								aMachineTypeDetails.available_on_stacks,
							)

							if (aMachineTypeConfig.default_machine_type === aMachineTypeID) {
								MachineType.defaults[aStackType] = machineType;
							}

							MachineType.all.push(machineType);
						});
					});
				});
			};

			return MachineType;
		});
})();
