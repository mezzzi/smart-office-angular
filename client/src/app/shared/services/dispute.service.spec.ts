import { TestBed, inject } from '@angular/core/testing';

import { DisputeService } from './dispute.service';

describe('DisputeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisputeService]
    });
  });

  it('should be created', inject([DisputeService], (service: DisputeService) => {
    expect(service).toBeTruthy();
  }));
});
