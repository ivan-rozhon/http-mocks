import xhrMock, { MockRequest, MockResponse, proxy } from 'xhr-mock';
import { MockHeaders } from 'xhr-mock/lib/MockHeaders';

import { parse } from 'query-string';

import delay from 'delay';

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
    useProxy = true,
    loggingEnabled = false,
    useHash = false,
    mockScenarioKey = extractMockScenarioFromLocation(window.location, useHash),
    defaultResponseCode = 200,
    defaultResponseHeaders = {},
    defaultDelay = 0
  }: MockOptions = {}
): void => {
  xhrMock.setup();

  getScenarioMocks(mockScenarios, mockScenarioKey).forEach((mock: Mock) => {
    createMock(
      {
        responseCode: defaultResponseCode,
        responseHeaders: defaultResponseHeaders,
        delay: defaultDelay,
        ...mock
      },
      loggingEnabled
    );
  });

  if (useProxy) {
    xhrMock.use(proxy);
  }
};

/**
 * Gets the corresponding value for `mockScenario` key in the browser's Location object.
 */
export const extractMockScenarioFromLocation = (
  location: Location,
  useHash: boolean
): string => {
  const locationSearcn = useHash
    ? location.hash.replace(/^(#\/|#|\/)+/g, '')
    : location.search;

  const { mockScenario = 'default' } = parse(locationSearcn);

  if (Array.isArray(mockScenario)) {
    throw new Error('Only one mock scenario may be used at a time');
  }

  return mockScenario;
};

const getScenarioMocks = (
  mockScenarios: MockScenarios,
  mockScenarioKey: keyof MockScenarios
): Mock[] => {
  const defaultMocks = mockScenarios.default;

  if (mockScenarioKey === 'default') {
    return defaultMocks;
  }

  const selectedMocks = mockScenarios[mockScenarioKey];

  if (!selectedMocks) {
    throw new Error(`No mocks found for mock scenario '${mockScenarioKey}'`);
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

const createMock = (mock: Mock, loggingEnabled: boolean): void => {
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

const logMock = (
  mock: Mock,
  requestHeaders: MockHeaders,
  requestQuery: RequestQuery,
  requestBody: RequestBody,
  responseBody: any,
  responseHeaders: ResponseHeaders
): void => {
  console.groupCollapsed(mock.method, mock.url);

  console.log('Status Code:', mock.responseCode);
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
