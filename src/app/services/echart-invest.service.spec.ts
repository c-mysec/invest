import { TestBed } from '@angular/core/testing';

import { EchartInvestService } from './echart-invest.service';

describe('EchartInvestService', () => {
  let service: EchartInvestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EchartInvestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
