import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftReportComponent } from './shift-report.component';

describe('ShiftReportComponent', () => {
  let component: ShiftReportComponent;
  let fixture: ComponentFixture<ShiftReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
