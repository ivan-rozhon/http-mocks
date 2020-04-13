import axios, { AxiosResponse } from 'axios';

import { injectHttpMocks } from './inject-http-mocks';
import {
  MockOptions,
  MockParams,
  MockRequest,
  RequestBody,
  RequestQuery,
  Mock,
  HttpMethod,
  MockResponse
} from './http-mocks.model';

const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];

const userInfoMock: Mock[] = httpMethods.map((method: HttpMethod) => ({
  url: /userInfo/,
  method,
  responseFn: (requestQuery: RequestQuery, requestBody: RequestBody) => {
    return {
      userId: method === 'GET' ? 'irozhon' : requestBody.userId,
      firstName: 'Ivan',
      lastName: 'Rozhoň',
      group: requestQuery.group,
      job: requestQuery.job
    };
  }
}));

const authMock: Mock[] = httpMethods.map((method: HttpMethod) => ({
  url: /auth/,
  method,
  responseFn: _ => {
    return null;
  },
  responseHeaders: {
    'Access-Control-Allow-Origin': '*'
  }
}));

const userInfoUrl = 'userInfo?group=http-mocks&job=developer';
const authHeader = 'Bearer test-token';

const expectedUserInfo = {
  status: 200,
  data: {
    userId: 'irozhon',
    firstName: 'Ivan',
    lastName: 'Rozhoň',
    group: 'http-mocks',
    job: 'developer'
  }
};

const expectedAuth = {
  status: 202,
  data: null
};

const mockOptions: MockOptions = {
  responseProxyFn: (
    responseBody: any,
    mockParams: MockParams,
    mockRequest: MockRequest
  ): MockResponse => {
    if (mockParams.url.toString() === '/auth/') {
      const requestAuthHeader =
        mockRequest.requestHeaders.Authorization ||
        mockRequest.requestHeaders.authorization ||
        null;
      const responseCode = requestAuthHeader === authHeader ? 202 : 401;

      return {
        responseBody: { status: responseCode, data: responseBody },
        responseCode,
        responseHeaders: mockParams.responseHeaders
      };
    }

    return {
      responseBody: { status: mockParams.responseCode, data: responseBody },
      responseCode: mockParams.responseCode,
      responseHeaders: mockParams.responseHeaders
    };
  }
};

injectHttpMocks(
  {
    default: [...userInfoMock, ...authMock]
  },
  mockOptions
);

describe('#injectHttpMocks Fetch API', () => {
  httpMethods.forEach((method: HttpMethod) => {
    it(`${method} /userInfo/ should return correct response`, async (doneFn: DoneFn) => {
      const fetchResponse = await fetch(
        userInfoUrl,
        method === 'GET'
          ? { method }
          : {
              method,
              body: JSON.stringify({
                userId: 'irozhon'
              })
            }
      )
        .then((response: Response) => response.json())
        .then((value: any) => value);

      expect(fetchResponse).toEqual(expectedUserInfo);

      doneFn();
    });
  });

  httpMethods.forEach((method: HttpMethod) => {
    it(`${method} /auth/ should return correct response (status: 202)`, async (doneFn: DoneFn) => {
      const fetchResponse = await fetch('auth', {
        method,
        headers: {
          Authorization: authHeader
        }
      })
        .then((response: Response) => response.json())
        .then((value: any) => value);

      expect(fetchResponse).toEqual(expectedAuth);

      doneFn();
    });

    it(`${method} /auth/ should return correct status (status: 401)`, async (doneFn: DoneFn) => {
      const fetchResponseStatus = await fetch('auth', {
        method
      }).then((response: Response) => response.status);

      expect(fetchResponseStatus).toEqual(401);

      doneFn();
    });

    it(`${method} /auth/ should return correct 'Access-Control-Allow-Origin' header`, async (doneFn: DoneFn) => {
      const fetchResponseHeaders = await fetch('auth', {
        method,
        headers: {
          Authorization: authHeader
        }
      })
        .then((response: Response) => response.headers)
        .then((value: any) => value);

      expect(fetchResponseHeaders.get('Access-Control-Allow-Origin')).toEqual(
        '*'
      );

      doneFn();
    });
  });
});

describe('#injectHttpMocks XHR API', () => {
  httpMethods.forEach((method: HttpMethod) => {
    it(`${method} /userInfo/ should return correct response`, async (doneFn: DoneFn) => {
      const xhrResponse = await axios(
        method === 'GET'
          ? {
              url: userInfoUrl,
              method
            }
          : {
              url: userInfoUrl,
              method,
              data: {
                userId: 'irozhon'
              }
            }
      ).then((response: AxiosResponse) => response.data);

      expect(xhrResponse).toEqual(expectedUserInfo);

      doneFn();
    });
  });

  httpMethods.forEach((method: HttpMethod) => {
    it(`${method} /auth/ should return correct response (status: 202)`, async (doneFn: DoneFn) => {
      const xhrResponse = await axios({
        url: 'auth',
        method,
        headers: { Authorization: authHeader }
      }).then((response: AxiosResponse) => response.data);

      expect(xhrResponse).toEqual(expectedAuth);

      doneFn();
    });

    it(`${method} /auth/ should return correct status (status: 401)`, async (doneFn: DoneFn) => {
      const xhrResponseStatus = await axios({
        url: 'auth',
        method
      }).catch((error: any) => error.response.status);

      expect(xhrResponseStatus).toEqual(401);

      doneFn();
    });

    it(`${method} /auth/ should return correct 'Access-Control-Allow-Origin' header`, async (doneFn: DoneFn) => {
      const xhrResponseHeaders = await axios({
        url: 'auth',
        method,
        headers: { Authorization: authHeader }
      }).then((response: AxiosResponse) => response.headers);

      expect(
        xhrResponseHeaders['Access-Control-Allow-Origin'.toLowerCase()]
      ).toEqual('*');

      doneFn();
    });
  });
});
