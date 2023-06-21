import { TestBed } from '@angular/core/testing';

import { BancoCentralService } from './banco-central.service';

describe('BancoCentralService', () => {
  let service: BancoCentralService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BancoCentralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
