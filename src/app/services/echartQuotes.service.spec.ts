import { TestBed } from '@angular/core/testing';

import { EchartQuotesService } from './echartQuotes.service';

describe('EchartQuotesService', () => {
  let service: EchartQuotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EchartQuotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
