import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServerResponse } from '../interfaces';
import { UrlConfig } from '../configs';
import { Observable } from 'rxjs';
import {defaultHttpOptions} from '../configs/http.config';

@Injectable({
  providedIn: 'root'
})
export class DisputeService {

  constructor(private http: HttpClient) { }

  // report dispute
  addDispute(dispute): Observable<ServerResponse> {
    return this.http.post<any>(UrlConfig.DISPUTE_URL, dispute, defaultHttpOptions);
  }

  // get disputes
  getDisputes(): Observable<ServerResponse> {
    return this.http.get<any>(UrlConfig.DISPUTE_URL, defaultHttpOptions);
  }
}
