import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {UrlConfig} from '../configs';
import {defaultHttpOptions} from '../configs/http.config';

@Injectable()
export class HttpService {

    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    getTimeStamp(): Promise<any> {
        return this.http.get<any>(UrlConfig.TIMESTAMP_URL, defaultHttpOptions).toPromise();
    }

}
