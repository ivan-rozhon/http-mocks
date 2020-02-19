import { MockHeaders } from 'xhr-mock/lib/MockHeaders';

import { MockOptions as FetchMockOptions } from 'fetch-mock';

import {
  Mock,
  RequestQuery,
  RequestBody,
  ResponseHeaders
} from './../http-mocks.model';

/**
 * Creates a collapsed group console log of the mock's request and response.
 * @param mock Entire object of the mock.
 * @param requestHeaders Headers of the request.
 * @param requestQuery Query parameters (extracted from URL search string) of the request.
 * @param requestBody Payload of the request.
 * @param responseBody Payload of the response (returned from `responseFn`).
 * @param responseHeaders Headers of the response.
 */
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
