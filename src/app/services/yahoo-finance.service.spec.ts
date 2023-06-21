import { TestBed } from '@angular/core/testing';

import { YahooFinanceService } from './yahoo-finance.service';

describe('YahooFinanceService', () => {
  let service: YahooFinanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YahooFinanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
