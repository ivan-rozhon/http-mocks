import { Mock, MockRequest, MockResponse } from './../http-mocks.model';

/**
 * Creates a collapsed group console log of the mock's request and response.
 */
export const logMock = (
  { method, url, delay }: Mock,
  { requestQuery, requestBody, requestHeaders }: MockRequest,
  { responseBody, responseCode, responseHeaders }: MockResponse
): void => {
  console.groupCollapsed(`${method} ${url}`);

  console.log('Status:', responseCode);
  console.log('Delay:', delay);

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
