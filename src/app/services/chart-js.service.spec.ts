import { TestBed } from '@angular/core/testing';

import { ChartJsService } from './chart-js.service';

describe('ChartJsService', () => {
  let service: ChartJsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
