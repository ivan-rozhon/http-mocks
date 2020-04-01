import { Mock, MockOptions } from './../http-mocks.model';

export const handleProxyFn = (
  responseData: any,
  mock: Mock,
  proxyFn?: MockOptions['proxyFn']
): any => {
  return proxyFn && typeof proxyFn === 'function'
    ? proxyFn(responseData, {
        url: mock.url,
        method: mock.method,
        responseCode: mock.responseCode
      })
    : responseData;
};
