import {
  Mock,
  MockOptions,
  MockResponse,
  MockRequest
} from './../http-mocks.model';

export const handleProxyFn = (
  responseBody: any,
  mock: Mock,
  mockRequest: MockRequest,
  proxyFn?: MockOptions['responseProxyFn']
): MockResponse => {
  return proxyFn && typeof proxyFn === 'function'
    ? proxyFn(
        responseBody,
        {
          url: mock.url,
          method: mock.method,
          responseCode: mock.responseCode,
          responseHeaders: mock.responseHeaders
        },
        mockRequest
      )
    : {
        responseBody,
        responseCode: mock.responseCode,
        responseHeaders: mock.responseHeaders
      };
};
