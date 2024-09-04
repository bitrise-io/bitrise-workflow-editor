import * as actual from './app-service';
import { fn } from '@storybook/test'

export * from './app-service';

export const getAppSlug = fn(actual.getAppSlug).mockName('getAppSlug');