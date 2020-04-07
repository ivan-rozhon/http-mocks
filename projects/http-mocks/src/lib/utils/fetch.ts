import {
  MockOptions as FetchMockOptions,
  MockResponse as FetchMockResponse
} from 'fetch-mock';

import fetchMock from 'fetch-mock/es5/client';

import { parseQueryParams } from './query';

import { logMock } from './log';

import { handleProxyFn } from './proxy';

import { Mock, MockOptions, MockResponse } from './../http-mocks.model';

export const fallbackToNetworkFetch = (fallbackToNetwork: boolean) => {
  fetchMock.config.fallbackToNetwork = fallbackToNetwork;
};

export const overwriteRoutesFetch = (overwriteRoutes: boolean) => {
  fetchMock.config.overwriteRoutes = overwriteRoutes;
};

export const createFetchMock = (
  mock: Mock,
  loggingEnabled: boolean,
  responseProxyFn: MockOptions['responseProxyFn']
): void => {
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
      const requestHeaders = headers;

      // response
      const responseBody = mock.responseFn(requestQuery, requestBody);
      const responseData: MockResponse = handleProxyFn(
        responseBody,
        mock,
        {
          requestQuery,
          requestBody,
          requestHeaders
        },
        responseProxyFn
      );

      const response: FetchMockResponse = {
        headers: responseData.responseHeaders,
        status: responseData.responseCode,
        body: responseData.responseBody
      };

      if (loggingEnabled) {
        logMock(
          mock,
          requestHeaders,
          requestQuery,
          requestBody,
          responseData.responseBody,
          responseData.responseHeaders
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
