/**
 * Extracts query string params and return them as an object.
 * @param locationSearch Query string to process.
 */
export const parseQueryParams = (
  locationSearch: string = ''
): Record<string, string> => {
  const urlSearchParams = new URLSearchParams(locationSearch);

  const queryParams = {};

  urlSearchParams.forEach((value: string, key: string) => {
    queryParams[key] = value;
  });

  return queryParams;
};
