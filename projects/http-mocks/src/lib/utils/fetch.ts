import {
  MockOptions as FetchMockOptions,
  MockResponse as FetchMockResponse
} from 'fetch-mock';

import fetchMock from 'fetch-mock/es5/client';

import { parseQueryParams } from './query';

import { logMock } from './log';

import { Mock } from './../http-mocks.model';

export const fallbackToNetworkFetch = (fallbackToNetwork: boolean) => {
  fetchMock.config.fallbackToNetwork = fallbackToNetwork;
};

export const createFetchMock = (mock: Mock, loggingEnabled: boolean): void => {
  fetchMock.mock(
    mock.url,
    (url: RegExp, { headers = {}, body = {} }: FetchMockOptions) => {
      const createdURL = createURL(url);

      // request
      const requestQuery = parseQueryParams(
        createdURL !== null
          ? createdURL.search
          : `?` + `${url}`.split('?').pop()
      );
      const requestBody = typeof body === 'string' ? JSON.parse(body) : body;

      // response
      const responseBody = mock.responseFn(requestQuery, requestBody);
      const response: FetchMockResponse = {
        headers: mock.responseHeaders,
        status: mock.responseCode,
        body: responseBody
      };

      if (loggingEnabled) {
        logMock(
          mock,
          headers,
          requestQuery,
          requestBody,
          responseBody,
          mock.responseHeaders
        );
      }

      return response;
    },
    {
      delay: mock.delay
    }
  );
};

const createURL = (url: RegExp | string): URL | null => {
  try {
    return new URL(`${url}`);
  } catch (_) {
    return null;
  }
};
