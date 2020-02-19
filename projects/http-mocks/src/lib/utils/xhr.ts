import xhrMock, { MockRequest, MockResponse, proxy } from 'xhr-mock';

import { delay } from './delay';

import { logMock } from './log';

import { Mock } from './../http-mocks.model';

export const setupXHRMock = (): void => {
  xhrMock.setup();
};

export const fallbackToNetworkXHR = (fallbackToNetwork: boolean) => {
  if (fallbackToNetwork) {
    xhrMock.use(proxy);
  }
};

export const createXHRMock = (mock: Mock, loggingEnabled: boolean): void => {
  xhrMock.use(
    mock.method,
    mock.url,
    async (mockRequest: MockRequest, mockResponse: MockResponse) => {
      // request
      const requestQuery = mockRequest.url().query || {};
      const requestBody =
        mockRequest.body() != null ? JSON.parse(mockRequest.body()) : {};

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
