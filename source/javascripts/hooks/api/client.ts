import axios from 'axios';
import flatten from 'lodash/flatten';
import getCookie from '@/utils/cookies';
import { camelCaseKeys, snakeCaseKeys } from '@/utils/changeCase';

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const transformRequest = flatten([snakeCaseKeys, axios.defaults.transformRequest || []]);
const transformResponse = flatten([axios.defaults.transformResponse || [], camelCaseKeys]);

export const monolith = axios.create({
  headers: {
    ...defaultHeaders,
    'X-CSRF-TOKEN': getCookie('CSRF-TOKEN'),
  },
  transformResponse,
  transformRequest,
});
