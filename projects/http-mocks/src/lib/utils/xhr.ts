import xhrMock, {
  MockRequest as XhrMockRequest,
  MockResponse as XhrMockResponse,
  proxy
} from 'xhr-mock';

import { delay } from './delay';

import { logMock } from './log';

import { handleProxyFn } from './proxy';

import { Mock, MockOptions, MockResponse } from './../http-mocks.model';

export const setupXHRMock = (): void => {
  xhrMock.setup();
};

export const fallbackToNetworkXHR = (fallbackToNetwork: boolean) => {
  if (fallbackToNetwork) {
    xhrMock.use(proxy);
  }
};

export const createXHRMock = (
  mock: Mock,
  loggingEnabled: boolean,
  responseProxyFn?: MockOptions['responseProxyFn']
): void => {
  xhrMock.use(
    mock.method,
    mock.url,
    async (mockRequest: XhrMockRequest, mockResponse: XhrMockResponse) => {
      // request
      const requestQuery = mockRequest.url().query || {};
      const requestBody =
        mockRequest.body() != null ? JSON.parse(mockRequest.body()) : {};
      const requestHeaders = mockRequest.headers();

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

      const response = mockResponse
        .status(responseData.responseCode)
        .body(responseData.responseBody)
        .headers(responseData.responseHeaders);

      await delay(mock.delay);

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
    }
  );
};
