import { delay, http, HttpResponse } from 'msw';
import StackApi from '@/core/api/StackApi';

export const getAllStacks = () => {
  return http.get(StackApi.getStacksPath(':appSlug'), async () => {
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
