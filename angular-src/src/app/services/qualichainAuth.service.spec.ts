import { TestBed } from '@angular/core/testing';

import { QualichainAuthService } from './qualichainAuth.service';

describe('QualichainAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QualichainAuthService = TestBed.get(QualichainAuthService);
    expect(service).toBeTruthy();
  });
});
