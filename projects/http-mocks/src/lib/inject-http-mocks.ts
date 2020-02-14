import xhrMock, { MockRequest, MockResponse, proxy } from 'xhr-mock';
import { MockHeaders } from 'xhr-mock/lib/MockHeaders';

import {
  MockOptions as FetchMockOptions,
  MockResponse as FetchMockResponse
} from 'fetch-mock';

import fetchMock from 'fetch-mock/es5/client';

import { delay } from './delay';

import {
  MockScenarios,
  MockOptions,
  Mock,
  RequestQuery,
  RequestBody,
  ResponseHeaders
} from './http-mocks.model';

export const injectHttpMocks = (
  mockScenarios: MockScenarios,
  {
    fallbackToNetwork = true,
    loggingEnabled = false,
    useLocationHash = false,
    mockScenario = extractMockScenarioFromLocation(
      window.location,
      useLocationHash
    ),
    defaultResponseCode = 200,
    defaultResponseHeaders = {},
    defaultDelay = 0
  }: MockOptions = {}
): void => {
  xhrMock.setup();

  getScenarioMocks(mockScenarios, mockScenario).forEach((mock: Mock) => {
    const updatedMock: Mock = {
      responseCode: defaultResponseCode,
      responseHeaders: defaultResponseHeaders,
      delay: defaultDelay,
      ...mock
    };

    // create mocks for both XHR an Fetch API
    createXHRMock(updatedMock, loggingEnabled);
    createFetchMock(updatedMock, loggingEnabled);
  });

  if (fallbackToNetwork) {
    xhrMock.use(proxy);
    fetchMock.config.fallbackToNetwork = true;
  }
};

/**
 * Gets the corresponding value for `mockScenario` key in the browser's Location object.
 */
export const extractMockScenarioFromLocation = (
  location: Location,
  useLocationHash: boolean
): string => {
  const locationSearch = useLocationHash
    ? location.hash.replace(/^(#\/|#|\/)+/g, '')
    : location.search;

  const { mockScenario = 'default' } = parseQueryParams(locationSearch);

  if (Array.isArray(mockScenario)) {
    throw new Error('Only one mock scenario may be used at a time');
  }

  return mockScenario;
};

const getScenarioMocks = (
  mockScenarios: MockScenarios,
  mockScenario: keyof MockScenarios
): Mock[] => {
  const defaultMocks = mockScenarios.default;

  if (mockScenario === 'default') {
    return defaultMocks;
  }

  const selectedMocks = mockScenarios[mockScenario];

  if (!selectedMocks) {
    throw new Error(`No mocks found for mock scenario '${mockScenario}'`);
  }

  return [
    ...selectedMocks,
    ...defaultMocks.filter(
      (defaultMock: Mock) =>
        selectedMocks.findIndex(
          (mock: Mock) =>
            mock.method === defaultMock.method &&
            mock.url.toString() === defaultMock.url.toString()
        ) === -1
    )
  ];
};

const createXHRMock = (mock: Mock, loggingEnabled: boolean): void => {
  xhrMock.use(
    mock.method,
    mock.url,
    async (mockRequest: MockRequest, mockResponse: MockResponse) => {
      // request
      const requestQuery = mockRequest.url().query;
      const requestBody =
        mockRequest.body() != null ? JSON.parse(mockRequest.body()) : null;

      // response
      const responseBody: any = mock.responseFn(requestQuery, requestBody);
      const response = mockResponse
        .status(mock.responseCode)
        .body(responseBody)
        .headers(mock.responseHeaders);

      await delay(mock.delay);

      if (loggingEnabled) {
        logMock(
          mock,
          mockRequest.headers(),
          requestQuery,
          requestBody,
          response.body(),
          response.headers()
        );
      }

      return response;
    }
  );
};

const createFetchMock = (mock: Mock, loggingEnabled: boolean): void => {
  fetchMock.mock(
    mock.url,
    (url: RegExp, { headers = null, body = null }: FetchMockOptions) => {
      const requestQuery = parseQueryParams(new URL(`${url}`).search);
      const requestBody = typeof body === 'string' ? JSON.parse(body) : body;

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

const parseQueryParams = (
  locationSearch: string = ''
): Record<string, string> => {
  const urlSearchParams = new URLSearchParams(locationSearch);

  const queryParams = {};

  urlSearchParams.forEach((value: string, key: string) => {
    queryParams[key] = value;
  });

  return queryParams;
};

const logMock = (
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
