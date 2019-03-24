import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {UrlConfig} from '../configs';
import {Location} from '../models';
import {defaultHttpOptions} from '../configs/http.config';
import {ServerResponse} from '../interfaces';

@Injectable()
export class LocationService {

    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    getLocationById(id: string): Observable<ServerResponse> {
        const searchUrl = `${UrlConfig.LOCATION_URL}/details/${id}`;
        return this.http.get<any>(searchUrl);
    }

    getLocationByName(name: string): Observable<ServerResponse> {
        const searchUrl = `${UrlConfig.LOCATION_URL}/${name}`;
        return this.http.get<any>(searchUrl);
    }

    addLocation(location: Location): Observable<ServerResponse> {
        const addUrl = UrlConfig.LOCATION_URL;
        return this.http.post<ServerResponse>(addUrl, location, defaultHttpOptions);
    }

    updateLocation(location: Location): Observable<ServerResponse> {
        const updateUrl = `${UrlConfig.LOCATION_URL}/${location._id}`;
        return this.http.put<ServerResponse>(updateUrl, location, defaultHttpOptions);
    }

    deleteLocation(id: String): Observable<ServerResponse> {
        const deleteUrl = `${UrlConfig.LOCATION_URL}/${id}`;
        return this.http.delete<ServerResponse>(deleteUrl);
    }

}
