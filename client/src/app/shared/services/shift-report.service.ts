import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServerResponse } from '../interfaces';
import { UrlConfig } from '../configs';
import { Observable } from 'rxjs';
import {defaultHttpOptions} from '../configs/http.config';

@Injectable({
  providedIn: 'root'
})
export class ShiftReportService {

  constructor(private http: HttpClient) { }

  getShitReports(): Observable<ServerResponse> {
    return this.http.get<any>(UrlConfig.SHIFT_REPORT_URL, defaultHttpOptions);
  }

  addShiftReport(report): Observable<ServerResponse> {
    return this.http.post<any>(UrlConfig.SHIFT_REPORT_URL, report);
  }
}
