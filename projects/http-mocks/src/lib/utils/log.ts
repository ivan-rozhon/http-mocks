import { MockHeaders } from 'xhr-mock/lib/MockHeaders';

import { MockOptions as FetchMockOptions } from 'fetch-mock';

import {
  Mock,
  RequestQuery,
  RequestBody,
  ResponseHeaders
} from './../http-mocks.model';

export const logMock = (
  mock: Mock,
  requestHeaders: MockHeaders | FetchMockOptions['headers'],
  requestQuery: RequestQuery,
  requestBody: RequestBody,
  responseBody: any,
  responseHeaders: ResponseHeaders
): void => {
  console.groupCollapsed(`${mock.method} ${mock.url}`);

  console.log('Status:', mock.responseCode);
  console.log('Delay:', mock.delay);

  console.group('Request');
  console.log('Headers:', requestHeaders);
  console.log('Query:', requestQuery);
  console.log('Body:', requestBody);
  console.groupEnd();

  console.group('Response');
  console.log('Headers:', responseHeaders);
  console.log('Body:', responseBody);
  console.groupEnd();

  console.groupEnd();
};
