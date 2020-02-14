export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type RequestQuery = Record<string, any>;
export type RequestBody = Record<string, any> | null;

export type ResponseHeaders = Record<string, any>;

export interface Mock {
  url: RegExp;
  method: HttpMethod;
  responseFn: (requestQuery: RequestQuery, requestBody: RequestBody) => any;
  responseCode?: number;
  responseHeaders?: ResponseHeaders;
  delay?: number;
}

export interface MockScenarios {
  default: Mock[];
  [mockScenario: string]: Mock[];
}

export interface MockOptions {
  fallbackToNetwork?: boolean;
  loggingEnabled?: boolean;
  useLocationHash?: boolean;
  mockScenario?: keyof MockScenarios;
  defaultResponseCode?: number;
  defaultResponseHeaders?: ResponseHeaders;
  defaultDelay?: number;
}
