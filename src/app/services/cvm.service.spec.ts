import { TestBed } from '@angular/core/testing';

import { CvmService } from './cvm.service';

describe('CvmService', () => {
  let service: CvmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CvmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
