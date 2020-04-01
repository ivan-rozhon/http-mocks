export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type RequestQuery = Record<string, any>;
export type RequestBody = Record<string, any> | null;

export type ResponseHeaders = Record<string, any>;

export type MockParams = Omit<Mock, 'responseFn' | 'responseHeaders' | 'delay'>;

export interface Mock {
  /**
   * A regular expression that should match with the URL of the HTTP request.
   */
  url: RegExp;

  /**
   * HTTP method.
   */
  method: HttpMethod;

  /**
   * A function that contains a logic that returns response data accordingly to the request (query params and payload).
   */
  responseFn: (requestQuery: RequestQuery, requestBody: RequestBody) => any;

  /**
   * Status code of the HTTP transaction. (default: `200`)
   */
  responseCode?: number;

  /**
   * Headers of the response. (default: `{}`)
   */
  responseHeaders?: ResponseHeaders;

  /**
   * Time of the response delay (in milliseconds). (default: `0`)
   */
  delay?: number;
}

export interface MockScenarios {
  default: Mock[];
  [mockScenario: string]: Mock[];
}

export interface MockOptions {
  /**
   * Whether pass through the request to the network if no mock exists. (default: `true`)
   */
  fallbackToNetwork?: boolean;

  /**
   * Whether log information about request/response of the mock to the console. (default: `false`)
   */
  loggingEnabled?: boolean;

  /**
   * Whether accept search string placed after the hashtag in URL,
   * e.g. `http://localhost:4200/#/?mockScenario=scenarioKey`. (default: `false`)
   */
  useLocationHash?: boolean;

  /**
   * The scenario key to use for mocking. (default: `'default'`)
   */
  mockScenario?: keyof MockScenarios;

  /**
   * Common response code for all mocks that can be overridden by the response code of the particular mock. (default: `200`)
   */
  defaultResponseCode?: number;

  /**
   * Common response headers for all mocks that can be overridden by the response headers of the particular mock. (default: `{}`)
   */
  defaultResponseHeaders?: ResponseHeaders;

  /**
   * Common mock delay for all mocks that can be overridden by the mock delay of the particular mock. (default: `0`)
   */
  defaultDelay?: number;

  /**
   * Wrapper function that applies to all mock responses.
   * Useful when you change the overall data response structure without an impact on the data.
   */
  proxyFn?: (responseBody: any, mockParams: MockParams) => any;
}
