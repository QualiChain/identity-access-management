import { TestBed } from '@angular/core/testing';

import { QualichainService } from './qualichain.service';

describe('QualichainService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QualichainService = TestBed.get(QualichainService);
    expect(service).toBeTruthy();
  });
});
