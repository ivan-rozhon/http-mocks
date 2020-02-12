import { Injectable } from '@angular/core';

import { MockScenarios, MockOptions } from './http-mocks.model';
import { injectHttpMocks } from './inject-http-mocks';

@Injectable({ providedIn: 'root' })
export class HttpMocksService {
  setHttpMocks(mockScenarios: MockScenarios, mockOptions: MockOptions) {
    injectHttpMocks(mockScenarios, mockOptions);
  }
}
