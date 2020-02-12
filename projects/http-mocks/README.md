# http-mocks

This mocking library is an easy-to-use and lightweight version of awesome library [data-mocks](https://github.com/ovotech/data-mocks) with a few additional features like a:

- console logs of the requests and responses
- access to the body and query parameters of the request within the particular mock (so you can modify a response according to the request)
- better support for the Angular applications, however, it is still framework agnostic

Lots of code in this library is very similar to the code of the [data-mocks](https://github.com/ovotech/data-mocks) library. So huge thanks to the authors!

## Usage (Angular)

- Install the package in your project as a dependency:

```
npm install http-mocks --save-dev
```

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

@NgModule({
  declarations: [AppComponent],
  imports: [
    ...
  ],
  providers: [
    httpMocksProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```
