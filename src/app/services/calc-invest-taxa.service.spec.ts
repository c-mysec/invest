import { TestBed } from '@angular/core/testing';

import { CalcInvestTaxaService } from './calc-invest-taxa.service';

describe('CalcInvestTaxaService', () => {
  let service: CalcInvestTaxaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalcInvestTaxaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
