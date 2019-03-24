import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {UrlConfig} from '../configs';
import {ServerResponse} from '../interfaces';
import {CorporateClient} from '../models/corporate.client.model';

@Injectable()
export class CorporateClientService {

    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    getCorporates(): Promise<ServerResponse> {
        return this.http.get<ServerResponse>(UrlConfig.CORPORATE_URL).toPromise();
    }

    addCorporate(corporate: CorporateClient): Observable<ServerResponse> {
        return this.http.post<ServerResponse>(UrlConfig.CORPORATE_URL, corporate);
    }

    updateCorporate(corporate: CorporateClient): Observable<ServerResponse> {
        const updateUrl = `${UrlConfig.CORPORATE_URL}/${corporate._id}`;
        return this.http.put<ServerResponse>(updateUrl, corporate);
    }

    deleteCorporate(id: String): Observable<ServerResponse> {
        const deleteUrl = `${UrlConfig.CORPORATE_URL}/${id}`;
        return this.http.delete<ServerResponse>(deleteUrl);
    }

}
