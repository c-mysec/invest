import { TestBed } from '@angular/core/testing';

import { CalcInvestCotasService } from './calc-invest-cotas.service';

describe('CalcInvestCotasService', () => {
  let service: CalcInvestCotasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalcInvestCotasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
