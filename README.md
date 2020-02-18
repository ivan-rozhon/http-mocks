# http-mocks

This HTTP mocking library (_XHR_ and _Fetch API_) is an easy-to-use and lightweight version of awesome library [data-mocks](https://github.com/ovotech/data-mocks) with a few additional features:

- console logs of the requests and responses (`loggingEnabled` parameter in the `MockOptions`)
- access to the body and query parameters of the request within the particular mock (so you can modify a response according to the request)
- better support for the **Angular** applications, however, it stays framework agnostic:
  - option to accept location string after a hashtag (e.g. `http://localhost:4200/#/?mockScenario=scenarioKey`)
  - `HttpMocksService` to easily inject mocks into your app
- option to set default response code, headers and, delay
- works in IE11 (requires `URLSearchParams` polyfill):

  ```ts
  import 'core-js/features/url-search-params';
  ```

Lots of code in this library is very similar to the code of the [data-mocks](https://github.com/ovotech/data-mocks) library. So huge thanks to the authors!

## Instalation

- Install the package in your project as a dependency:

```
npm install http-mocks --save-dev
```

## Usage (Angular)

- Setup the `http-mocks` provider:

```ts
import { Provider, APP_INITIALIZER } from '@angular/core';

import {
  HttpMocksService,
  MockScenarios,
  RequestQuery,
  RequestBody
} from 'http-mocks';

export const httpMocksProvider: Provider = {
  provide: APP_INITIALIZER,
  useFactory: httpMocksProviderFactory,
  deps: [HttpMocksService],
  multi: true
};

// Create factory function for the http-mocks provider
function httpMocksProviderFactory(httpMocksService: HttpMocksService) {
  return () =>
    httpMocksService.setHttpMocks(mocks, {
      loggingEnabled: true,
      useHash: true
    });
}

// Prepare mocks at least for the `default` scenario
const mocks: MockScenarios = {
  default: [
    {
      url: /getUserInfo/,
      method: 'POST',
      responseFn: (requestQuery: RequestQuery, requestBody: RequestBody) => {
        return {
          userId: requestBody.userId,
          firstName: 'John',
          lastName: 'Doe'
        };
      },
      delay: 1500,
      responseCode: 200
    }
  ]
};
```

- Add the `http-mocks` provider to your `app.module.ts`:

```ts
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    ...
  ],
  providers: [
    ...(environment.production ? [] : [httpMocksProvider])
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Usage (regardless of the framework)

- Import the `injectHttpMocks` function into your project and use it:

```ts
import { injectHttpMocks, RequestQuery, RequestBody } from 'http-mocks';

injectHttpMocks(
  {
    default: [
      {
        url: /getUserInfo/,
        method: 'POST',
        responseFn: (requestQuery: RequestQuery, requestBody: RequestBody) => {
          return {
            userId: requestBody.userId,
            firstName: 'John',
            lastName: 'Doe'
          };
        },
        delay: 1500,
        responseCode: 200
      }
    ]
  },
  {
    loggingEnabled: true,
    useHash: true
  }
);
```

## Mocks & Options

(Within the `setHttpMocks` method of the `HttpMocksService`, or `injectHttpMocks` function itself.)

```ts
setHttpMocks(mockScenarios: MockScenarios, mockOptions: MockOptions) {
  injectHttpMocks(mockScenarios, mockOptions);
}
```

### Mock (Mock Scenarios)

`MockScenarios` object contains user-defined arrays of mocks (`Mock[]`). Each array represents one scenario. A particular scenario should be selected either via `mockScenario` parameter in the `MockOptions` or via query parameter `?mockScenario` in the URL of the running application.

```ts
interface Mock {
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
   * Status code of the HTTP transaction.
   */
  responseCode?: number;

  /**
   * Headers of the response.
   */
  responseHeaders?: ResponseHeaders;

  /**
   * Time of the response delay (in milliseconds).
   */
  delay?: number;
}
```

### Mock Options

```ts
interface MockOptions {
  /**
   * Whether pass through the request to the network if no mock exists. (default:,  `true`)
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
   * The scenario key to use for mocking. (default `'default'`)
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
}
```
