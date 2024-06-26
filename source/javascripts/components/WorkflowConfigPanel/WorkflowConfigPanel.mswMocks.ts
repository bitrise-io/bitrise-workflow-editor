import { delay, http, HttpResponse } from 'msw';
import { GET_ALL_STACK_INFO_PATH } from './services/getAllStackInfo';
import { GET_MACHINE_TYPE_CONFIGS_PATH } from './services/getMachineTypeConfigs';

export const mockGetAllStackInfo = () => {
  return http.get(GET_ALL_STACK_INFO_PATH, async () => {
    await delay();

    return HttpResponse.json({
      available_stacks: {
        'osx-xcode-edge': {
          title: 'Always latest Xcode version with edge updates',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.4.x-edge': {
          title: 'Xcode 15.4 with edge updates',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.4.x': {
          title: 'Xcode 15.4',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.3.x-edge': {
          title: 'Xcode 15.3 with edge updates',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.3.x': {
          title: 'Xcode 15.3',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.2.x-edge': {
          title: 'Xcode 15.2 with edge updates',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.2.x': {
          title: 'Xcode 15.2',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.1.x-edge': {
          title: 'Xcode 15.1 with edge updates',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.1.x': {
          title: 'Xcode 15.1',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.0.x-edge': {
          title: 'Xcode 15.0.1 with edge updates',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-15.0.x': {
          title: 'Xcode 15.0.1',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['g2-m1.8core', 'g2-m1-max.5core', 'g2-m1-max.10core'],
        },
        'osx-xcode-14.3.x-ventura': {
          title: 'Xcode 14.3.1',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: [
            'g2.4core',
            'g2.8core',
            'g2-m1.8core',
            'g2.12core',
            'g2-m1-max.5core',
            'g2-m1-max.10core',
          ],
        },
        'osx-xcode-14.2.x-ventura-rosetta': {
          title: 'Xcode 14.2, Rosetta emulated',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: [
            'g2.4core',
            'g2.8core',
            'g2-m1.8core',
            'g2.12core',
            'g2-m1-max.5core',
            'g2-m1-max.10core',
          ],
        },
        'osx-xcode-14.2.x-ventura': {
          title: 'Xcode 14.2',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: [
            'g2.4core',
            'g2.8core',
            'g2-m1.8core',
            'g2.12core',
            'g2-m1-max.5core',
            'g2-m1-max.10core',
          ],
        },
        'osx-xcode-14.1.x-ventura': {
          title: 'Xcode 14.1',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: [
            'g2.4core',
            'g2.8core',
            'g2-m1.8core',
            'g2.12core',
            'g2-m1-max.5core',
            'g2-m1-max.10core',
          ],
        },
        'osx-xcode-13.4.x': {
          title: 'Xcode 13.4.1',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: [
            'g2.4core',
            'g2.8core',
            'g2-m1.8core',
            'g2.12core',
            'g2-m1-max.5core',
            'g2-m1-max.10core',
          ],
        },
        'osx-xcode-13.3.x': {
          title: 'Xcode 13.3.1,',
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: [
            'g2.4core',
            'g2.8core',
            'g2-m1.8core',
            'g2.12core',
            'g2-m1-max.5core',
            'g2-m1-max.10core',
          ],
        },
        'linux-docker-android-22.04': {
          title: 'Ubuntu 22.04 for Android \u0026 Docker',
          'project-types': ['android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['standard', 'elite', 'elite-xl'],
        },
        'linux-docker-android-20.04': {
          title: 'Ubuntu 20.04 for Android \u0026 Docker',
          'project-types': ['android', 'cordova', 'ionic', 'react-native', 'flutter'],
          available_machines: ['standard', 'elite', 'elite-xl'],
        },
        'agent-pool-34563563456-34563456-34563567': {
          title: "Self-Hosted Runner: Someone's test pool",
          'project-types': ['ios', 'osx', 'macos', 'android', 'cordova', 'ionic', 'react-native', 'flutter', 'other'],
        },
      },
      project_types_with_default_stacks: {
        android: { default_stack: 'linux-docker-android-22.04' },
        cordova: { default_stack: 'osx-xcode-15.4.x' },
        flutter: { default_stack: 'osx-xcode-15.4.x' },
        ionic: { default_stack: 'osx-xcode-15.4.x' },
        ios: { default_stack: 'osx-xcode-15.4.x' },
        macos: { default_stack: 'osx-xcode-15.4.x' },
        other: { default_stack: 'linux-docker-android-22.04' },
        'react-native': { default_stack: 'osx-xcode-15.4.x' },
        _validation: { default_stack: 'osx-xcode-15.4.x' },
      },
      running_builds_on_private_cloud: false,
    });
  });
};

export const mockGetMachineTypeConfigs = () => {
  return http.get(GET_MACHINE_TYPE_CONFIGS_PATH, async () => {
    await delay();

    return HttpResponse.json({
      available_machine_type_configs: {
        osx: {
          default_machine_type: 'g2-m1.8core',
          machine_types: {
            'g2.4core': {
              name: 'Intel Medium',
              cpu_count: '4 vCPU',
              cpu_description: '3.2GHz',
              ram: '19 GB RAM',
              credit_per_min: 2,
              is_available: true,
              note: '',
              tag: 'gen2',
              type: 'standard',
              chip: 'intel',
              beta_tags: ['gen2-machine-types'],
              replacement_machine_type_ids: ['g2-m1.4core', 'g2-m1.8core'],
              available_on_stacks: [
                'osx-xcode-13.3.x',
                'osx-xcode-13.4.x',
                'osx-xcode-14.1.x-ventura',
                'osx-xcode-14.2.x-ventura',
                'osx-xcode-14.2.x-ventura-rosetta',
                'osx-xcode-14.3.x-ventura',
                'osx-xcode-15.2.x-dedicated',
              ],
            },
            'g2.8core': {
              name: 'Intel Large',
              cpu_count: '8 vCPU',
              cpu_description: '3.2GHz',
              ram: '35 GB RAM',
              credit_per_min: 4,
              is_available: true,
              note: '',
              tag: 'gen2',
              type: 'elite',
              chip: 'intel',
              beta_tags: ['gen2-machine-types', 'starter-package-grandfathered'],
              replacement_machine_type_ids: ['g2-m1.4core', 'g2-m1.8core'],
              available_on_stacks: [
                'osx-xcode-13.3.x',
                'osx-xcode-13.4.x',
                'osx-xcode-14.1.x-ventura',
                'osx-xcode-14.2.x-ventura',
                'osx-xcode-14.2.x-ventura-rosetta',
                'osx-xcode-14.3.x-ventura',
                'osx-xcode-15.2.x-dedicated',
              ],
            },
            'g2-m1.8core': {
              name: 'M1 Large',
              cpu_count: '8 CPU',
              cpu_description: '3.2GHz',
              ram: '12 GB RAM',
              credit_per_min: 4,
              is_available: true,
              note: '',
              tag: 'gen2',
              type: 'elite-xl',
              chip: 'apple',
              beta_tags: ['m1', 'starter-package-grandfathered'],
              available_on_stacks: [
                'osx-xcode-13.3.x',
                'osx-xcode-13.4.x',
                'osx-xcode-14.1.x-ventura',
                'osx-xcode-14.2.x-ventura',
                'osx-xcode-14.2.x-ventura-rosetta',
                'osx-xcode-14.3.x-ventura',
                'osx-xcode-15.0.x',
                'osx-xcode-15.0.x-edge',
                'osx-xcode-15.1.x',
                'osx-xcode-15.1.x-edge',
                'osx-xcode-15.1.x-las',
                'osx-xcode-15.2.x',
                'osx-xcode-15.2.x-edge',
                'osx-xcode-15.2.x-las',
                'osx-xcode-15.3.x',
                'osx-xcode-15.3.x-edge',
                'osx-xcode-15.3.x-las',
                'osx-xcode-15.4.x',
                'osx-xcode-15.4.x-edge',
                'osx-xcode-edge',
                'osx-xcode-jollyjoker-gulliver-atl01-ded001-sales',
                'osx-xcode-jollyjoker-nilsholgersson-atl01-ded001-sales',
              ],
            },
            'g2.12core': {
              name: 'Intel X Large',
              cpu_count: '12 vCPU',
              cpu_description: '3.2GHz',
              ram: '54 GB RAM',
              credit_per_min: 6,
              is_available: true,
              note: '',
              tag: 'gen2',
              type: 'elite-xl',
              chip: 'intel',
              beta_tags: ['gen2-machine-types'],
              replacement_machine_type_ids: ['g2-m1.4core', 'g2-m1.8core', 'g2-m1-max.5core'],
              available_on_stacks: [
                'osx-xcode-13.3.x',
                'osx-xcode-13.4.x',
                'osx-xcode-14.1.x-ventura',
                'osx-xcode-14.2.x-ventura',
                'osx-xcode-14.2.x-ventura-rosetta',
                'osx-xcode-14.3.x-ventura',
                'osx-xcode-15.2.x-dedicated',
              ],
            },
            'g2-m1-max.5core': {
              name: 'M1 Max Medium',
              cpu_count: '5 CPU',
              cpu_description: '3.2GHz',
              ram: '27 GB RAM',
              credit_per_min: 6,
              is_available: true,
              note: '',
              tag: 'gen2',
              type: 'elite-xl',
              chip: 'apple',
              beta_tags: ['m1_max_2vms'],
              available_on_stacks: [
                'osx-xcode-13.3.x',
                'osx-xcode-13.4.x',
                'osx-xcode-14.1.x-ventura',
                'osx-xcode-14.2.x-ventura',
                'osx-xcode-14.2.x-ventura-rosetta',
                'osx-xcode-14.3.x-ventura',
                'osx-xcode-15.0.x',
                'osx-xcode-15.0.x-edge',
                'osx-xcode-15.1.x',
                'osx-xcode-15.1.x-edge',
                'osx-xcode-15.2.x',
                'osx-xcode-15.2.x-edge',
                'osx-xcode-15.3.x',
                'osx-xcode-15.3.x-edge',
                'osx-xcode-15.4.x',
                'osx-xcode-15.4.x-edge',
                'osx-xcode-edge',
              ],
            },
            'g2-m1-max.10core': {
              name: 'M1 Max Large',
              cpu_count: '10 CPU',
              cpu_description: '3.2GHz',
              ram: '54 GB RAM',
              credit_per_min: 8,
              is_available: true,
              note: '',
              tag: 'gen2',
              type: 'elite-xl',
              chip: 'apple',
              beta_tags: ['m1_max_single_vm'],
              available_on_stacks: [
                'osx-xcode-13.3.x',
                'osx-xcode-13.4.x',
                'osx-xcode-14.1.x-ventura',
                'osx-xcode-14.2.x-ventura',
                'osx-xcode-14.2.x-ventura-rosetta',
                'osx-xcode-14.3.x-ventura',
                'osx-xcode-15.0.x',
                'osx-xcode-15.0.x-edge',
                'osx-xcode-15.1.x',
                'osx-xcode-15.1.x-edge',
                'osx-xcode-15.2.x',
                'osx-xcode-15.2.x-edge',
                'osx-xcode-15.3.x',
                'osx-xcode-15.3.x-edge',
                'osx-xcode-15.4.x',
                'osx-xcode-15.4.x-edge',
                'osx-xcode-edge',
                'osx-xcode-jollyjoker-pinky-atl01-ded001-sales',
              ],
            },
          },
        },
        linux: {
          default_machine_type: 'standard',
          machine_types: {
            standard: {
              name: 'Medium',
              cpu_count: '4 vCPU',
              cpu_description: '3.1GHz',
              ram: '16 GB RAM',
              credit_per_min: 1,
              is_available: true,
              note: '',
              tag: 'gen1',
              type: 'standard',
              chip: 'intel',
            },
            elite: {
              name: 'Large',
              cpu_count: '8 vCPU',
              cpu_description: '3.1GHz',
              ram: '32 GB RAM',
              credit_per_min: 2,
              is_available: true,
              note: '',
              tag: 'gen1',
              type: 'elite',
              chip: 'intel',
            },
            'elite-xl': {
              name: 'X Large',
              cpu_count: '16 vCPU',
              cpu_description: '3.1GHz',
              ram: '64 GB RAM',
              credit_per_min: 4,
              is_available: true,
              note: '',
              tag: 'gen1',
              type: 'elite-xl',
              chip: 'intel',
            },
          },
        },
      },
    });
  });
};
