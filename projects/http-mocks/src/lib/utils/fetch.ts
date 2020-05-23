import {
  MockOptions as FetchMockOptions,
  MockResponse as FetchMockResponse
} from 'fetch-mock';

import fetchMock from 'fetch-mock/es5/client';

import { parseQueryParams } from './query';

import { logMock } from './log';

import { handleProxyFn } from './proxy';

import { Mock, MockOptions, MockResponse } from './../http-mocks.model';

export const fallbackToNetworkFetch = (fallbackToNetwork: boolean): void => {
  fetchMock.config.fallbackToNetwork = fallbackToNetwork;
};

export const overwriteRoutesFetch = (overwriteRoutes: boolean): void => {
  fetchMock.config.overwriteRoutes = overwriteRoutes;
};

export const createFetchMock = (
  mock: Mock,
  loggingEnabled: boolean,
  responseProxyFn: MockOptions['responseProxyFn']
): void => {
  fetchMock.mock(
    mock.url,
    (url: RegExp, fetchMockOptions: FetchMockOptions) => {
      const body = fetchMockOptions?.body || {};
      const headers = fetchMockOptions?.headers || {};
      const createdURL = createURL(url);

      // request
      const requestQuery = parseQueryParams(
        createdURL !== null
          ? createdURL.search
          : removeAllBeforeChar(url.toString(), '?')
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
          {
            requestQuery,
            requestBody,
            requestHeaders
          },
          responseData
        );
      }

      return response;
    },
    {
      delay: mock.delay
    }
  );
};

/**
 * Tries to create a new instace of URL()
 */
const createURL = (url: RegExp | string): URL | null => {
  try {
    return new URL(`${url}`);
  } catch (_) {
    return null;
  }
};

/**
 * Removes all chars before specific char (char includes).
 * If char doesn't exist, returns an empty string.
 */
const removeAllBeforeChar = (value: string, char: string): string => {
  if (!value.includes(char)) {
    return '';
  }

  return `${value}`.split(char).pop();
};
