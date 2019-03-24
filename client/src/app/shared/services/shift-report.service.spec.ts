import { TestBed, inject } from '@angular/core/testing';

import { ShiftReportService } from './shift-report.service';

describe('ShiftReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShiftReportService]
    });
  });

  it('should be created', inject([ShiftReportService], (service: ShiftReportService) => {
    expect(service).toBeTruthy();
  }));
});
