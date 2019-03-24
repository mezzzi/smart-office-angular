import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {LogUtil} from '../utils';
import {Level, Label, UrlConfig} from '../configs';
import {User} from '../models';
import {ServerResponse} from '../interfaces';
import {defaultHttpOptions} from '../configs/http.config';

@Injectable()
export class UserService {

    private http: HttpClient;
    private managedUserLevel: Level;
    private isShowingProfile = new Subject<boolean>();

    constructor(http: HttpClient) {
        this.http = http;
    }

    setIsShowingProfile(showing: boolean) {
        this.isShowingProfile.next(showing);
    }

    getIsShowingProfile(): Observable<boolean> {
        return this.isShowingProfile.asObservable();
    }

    getAllUsers(managedUserLevel?: Level): Observable<ServerResponse> {
        let getUrl = this.getRequestUrl();
        if (managedUserLevel) {
            const tempLevel = this.managedUserLevel;
            this.managedUserLevel = managedUserLevel;
            getUrl = this.getRequestUrl();
            this.managedUserLevel = tempLevel;
        }
        LogUtil.ConsoleNag('get url: ' + getUrl);
        return this.http.get<ServerResponse>(getUrl);
    }

    getUserById(id: string): Observable<ServerResponse> {
        const getUrl = `${this.getRequestUrl()}/details/${id}`;
        return this.http.get<any>(getUrl);
    }

    getUserByPhone(phone: string): Observable<any> {
        const getUrl = `${this.getRequestUrl()}/search/phone/${phone}`;
        return this.http.get<any>(getUrl);
    }

    getUserByName(name: string): Observable<any> {
        let getUrl = `${this.getRequestUrl()}/${name}`;
        if (this.managedUserLevel === Level.DRIVER) {
            getUrl = `${this.getRequestUrl()}/search/name/${name}`;
        }
        return this.http.get<any>(getUrl);
    }

    addUser(user: User): Observable<ServerResponse> {
        const addUrl = this.getRequestUrl();
        return this.http.post<ServerResponse>(addUrl, user);
    }

    addMultipleUsers(users: User[]): Observable<ServerResponse> {
        let addMultipleUrl = this.getRequestUrl();
        addMultipleUrl = `${addMultipleUrl}/${'multiple'}`;
        return this.http.post<ServerResponse>(addMultipleUrl, users, defaultHttpOptions);
    }

    updateUser(user: User): Observable<ServerResponse> {
        let updateUrl = this.getRequestUrl();
        updateUrl = `${updateUrl}/${user._id}`;
        return this.http.put<ServerResponse>(updateUrl, user);
    }

    deleteUser(id: String): Observable<ServerResponse> {
        let deleteUrl = this.getRequestUrl();
        deleteUrl = `${deleteUrl}/${id}`;
        return this.http.delete<ServerResponse>(deleteUrl);
    }

    getRequestUrl(): string {
        let url = '';
        if (this.managedUserLevel === Level.SUPERVISOR) {
            url = UrlConfig.SUPERVISOR_URL;
        } else if (this.managedUserLevel === Level.DISPATCHER) {
            url = UrlConfig.DISPATCHER_URL;
        } else if (this.managedUserLevel === Level.DISPATCHER_SUPERVISOR) {
            url = UrlConfig.DISPATCHER_SUPERVISOR_URL;
        } else if (this.managedUserLevel === Level.DRIVER) {
            url = UrlConfig.DRIVER_URL;
        } else if (this.managedUserLevel === Level.CORPORATE_CLIENT) {
            url = UrlConfig.CORPORATE_URL;
        } else if (this.managedUserLevel === Level.CUSTOMER) {
            url = UrlConfig.CUSTOMER_URL;
        } else if (this.managedUserLevel === Level.FINANCE) {
            url = UrlConfig.FINANCE_URL;
        } else if (this.managedUserLevel === Level.DATA_ANALYST) {
            url = UrlConfig.DATAANALYST_URL;
        } else {
            LogUtil.ConsoleNag('unknown manged user type');
        }
        return url;
    }

    setManagedUserLevel(level: Level) {
        this.managedUserLevel = level;
    }

    getManagedUserLevel(): Level {
        return this.managedUserLevel;
    }

    // this is a string like Supervisor, Customer, Driver, Dispatcher ...
    getManagedUserLabel(): string {
        switch (this.managedUserLevel) {
            case Level.SUPERVISOR:
                return Label.SUPERVISOR_CAPITALIZED;
            case Level.DRIVER:
                return Label.DRIVER_CAPITALIZED;
            case Level.DISPATCHER:
                return Label.DISPATCHER_CAPITALIZED;
            case Level.CORPORATE_CLIENT:
                return Label.CORPORATE_CAPITALIZED;
            case Level.CUSTOMER:
                return Label.CUSTOMER_CAPITALIZED;
            case Level.FINANCE:
                return Label.FINANCE_CAPITALIZED;
            case Level.DATA_ANALYST:
                return Label.DATA_ANALYST_CAPITALIZED;
            case Level.DISPATCHER_SUPERVISOR:
                return Label.DISPATCHER_SUPERVISOR_CAPITALIZED;
            default:
                LogUtil.NagNag(`unrecognized managedUserLevel: ${this.managedUserLevel}`);
                return undefined;
        }
    }

    exportCustomers() {
        return this.http.get(UrlConfig.EXPORT_URL__CUSTOMER, {
            responseType: 'blob'
        });
    }

    exportDispatcherUsers() {
        return this.http.get(UrlConfig.EXPORT_URL__DISPATCHER, {
            responseType: 'blob'
        });
    }

    exportSupervisorUsers() {
        return this.http.get(UrlConfig.EXPORT_URL__SUPERVISOR, {
            responseType: 'blob'
        });
    }

    exportAdminrUsers() {
        return this.http.get(UrlConfig.EXPORT_URL__ADMIN, {
            responseType: 'blob'
        });
    }

    exportCorporateClient() {
        return this.http.get(UrlConfig.EXPORT_URL__CORPORATE_CLIENT, {
            responseType: 'blob'
        });
    }

    getDriverById(id: string): Observable<ServerResponse> {
        return this.http.get<any>(UrlConfig.DRIVER_URL + '/details/' + id);
    }

    // get all drivers
    getDrivers(): Observable<ServerResponse> {
        return this.http.get<any>(UrlConfig.DRIVER_URL);
    }

    // get all customers
    getCustomers(): Observable<ServerResponse> {
        return this.http.get<any>(UrlConfig.CUSTOMER_URL);
    }

    // get all dispatchers
    getDispatchers(): Observable<ServerResponse> {
        return this.http.get<any>(UrlConfig.DISPATCHER_URL);
    }
}
