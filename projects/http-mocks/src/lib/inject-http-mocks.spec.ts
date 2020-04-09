import axios, { AxiosResponse } from 'axios';

import { injectHttpMocks } from './inject-http-mocks';
import { RequestBody, RequestQuery, Mock } from './http-mocks.model';

const getUserInfo: Mock = {
  url: /getUserInfo/,
  method: 'POST',
  responseFn: (requestQuery: RequestQuery, requestBody: RequestBody) => {
    return {
      userId: requestBody.userId,
      firstName: 'John',
      lastName: 'Doe',
      group: requestQuery.group
    };
  }
};

const expectedGetUserInfo = {
  userId: '123',
  firstName: 'John',
  lastName: 'Doe',
  group: 'foo'
};

injectHttpMocks({
  default: [getUserInfo]
});

describe('Fetch API', () => {
  it('POST /getUserInfo/ should return correct response', async (doneFn: DoneFn) => {
    const fetchResponse = await fetch('getUserInfo?group=foo', {
      method: 'POST',
      body: JSON.stringify({
        userId: '123'
      })
    })
      .then((response: Response) => response.json())
      .then((value: any) => value);

    expect(fetchResponse).toEqual(expectedGetUserInfo);

    doneFn();
  });
});

describe('XHR API', () => {
  it('POST /getUserInfo/ should return correct response', async (doneFn: DoneFn) => {
    const xhrResponse = await axios
      .post('getUserInfo?group=foo', {
        userId: '123'
      })
      .then((response: AxiosResponse) => response.data);

    expect(xhrResponse).toEqual(expectedGetUserInfo);

    doneFn();
  });
});
