import {
  fallbackToNetworkFetch,
  overwriteRoutesFetch,
  createFetchMock,
  parseQueryParams,
  setupXHRMock,
  fallbackToNetworkXHR,
  createXHRMock
} from './utils';

import { MockScenarios, MockOptions, Mock } from './http-mocks.model';

/**
 * Main `http-mocks` method that handles entire creation of mocks for XHR and Fetch API.
 */
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
    defaultDelay = 0,
    proxyFn
  }: MockOptions = {}
): void => {
  // this needs to be placed before creating the XHR mocks
  setupXHRMock();

  // pick the right scenario mocks and create mock for every mock definition
  getScenarioMocks(mockScenarios, mockScenario).forEach((mock: Mock) => {
    // use default values in the first place
    const updatedMock: Mock = {
      responseCode: defaultResponseCode,
      responseHeaders: defaultResponseHeaders,
      delay: defaultDelay,
      ...mock
    };

    // create mocks for both XHR an Fetch API
    createXHRMock(updatedMock, loggingEnabled, proxyFn);
    createFetchMock(updatedMock, loggingEnabled, proxyFn);
  });

  // turn `fallbackToNetwork` on/off
  fallbackToNetworkXHR(fallbackToNetwork);
  fallbackToNetworkFetch(fallbackToNetwork);

  // turn `overwriteRoutesFetch` on/off (Fetch API only)
  overwriteRoutesFetch(true);
};

/**
 * Gets the corresponding value for `mockScenario` key in the browser's Location object.
 * @param location The location object (accesible via `window.location`)
 * @param useLocationHash Whether during a search for search params in URL accept hashtag or not.
 */
export const extractMockScenarioFromLocation = (
  location: Location,
  useLocationHash: boolean
): string => {
  const locationSearch = useLocationHash
    ? // remove leading symbols like: `#`, `#/`, `/`
      location.hash.replace(/^(#\/|#|\/)+/g, '')
    : location.search;

  const { mockScenario = 'default' } = parseQueryParams(locationSearch);

  if (Array.isArray(mockScenario)) {
    throw new Error('Error during processing the mock scenario');
  }

  return mockScenario;
};

/**
 * Picks the mocks from the current mock scenario.
 * @param mockScenarios Map of the mock scenarios.
 * @param mockScenario Key of the current mock scenario.
 */
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
    throw new Error(`No mocks found for mock scenario: '${mockScenario}'`);
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
