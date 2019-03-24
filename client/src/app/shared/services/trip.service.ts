import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CancellationCode, getCancellationLabel, UrlConfig} from '../configs';
import {defaultHttpOptions} from '../configs/http.config';
import * as socketio from 'socket.io-client';
import {Subject, from, Observable, BehaviorSubject} from 'rxjs';
import {Trip} from '../models';
import {ServerResponse} from '../interfaces';
import {LogUtil} from '../utils';

// noinspection TsLint
@Injectable()
export class TripService {

    private http: HttpClient;
    private socket: SocketIOClient.Socket;
    private valueObs: BehaviorSubject<Trip> = new BehaviorSubject<Trip>(null);
    private _pendingTrips: Trip[] = [];
    private _acceptedTrips: Trip[] = [];
    private _startedTrips: Trip[] = [];
    private _arrivedTrips: Trip[] = [];
    private _completedTrips: Trip[] = [];

    constructor(http: HttpClient) {
        this.http = http;
        this.socket = socketio(UrlConfig.DOMAIN_URL, {path: '', transports: ['websocket']});
        this.socket.on('connection', socket => console.log(socket));
    }

    public setFilteredTripToDisplay(value: Trip) {
        LogUtil.ConsoleNag('TRIP STATUS: ' + value.trip_status);
        this.valueObs.next(value);
    }

    public listenForFilteredTripDisplayRequest(): Observable<Trip> {
        return this.valueObs;
    }

    getTrips() {
        return this.http.get<any>(UrlConfig.TRIP_URL, defaultHttpOptions);
    }

    getTripById(id): Promise<any> {
        return this.http.get(`${UrlConfig.TRIP_URL}/${id}`, defaultHttpOptions).toPromise();
    }

    getTripByDispatcherId(id): Promise<any> {
        return this.http.get(`${UrlConfig.SEARCH_TRIP_BY_DISPATCHER_URL}/${id}`,
            defaultHttpOptions).toPromise();
    }

    addTrip(trip): Promise<ServerResponse> {
        return this.http.post<ServerResponse>(UrlConfig.TRIP_URL, trip, defaultHttpOptions).toPromise();
    }


    updateTrip(id, trip): Promise<ServerResponse> {
        return this.http.put<ServerResponse>(`${UrlConfig.TRIP_URL}/${id}`, trip, defaultHttpOptions).toPromise();
    }

    updateTripNotificationInfo(id, body): Promise<any> {
        return this.http.put(`${UrlConfig.TRIP_URL}/notified/${id}`, body, defaultHttpOptions).toPromise();
    }

    removeTripById(id) {
        return this.http.delete<any>(`${UrlConfig.TRIP_URL}/${id}`);
    }

    cancelTrip(id: String, code: CancellationCode): Promise<ServerResponse> {

        return this.http.get<ServerResponse>(`${UrlConfig.TRIP_URL}/cancel/${id}`,
            {params: {code: getCancellationLabel(code)}}).toPromise();
    }

    // get pending trips
    getPendingTrips(): Promise<ServerResponse> {
        return this.http.get<any>(UrlConfig.TRIP_URL__PENDING).toPromise().then(
            (data: ServerResponse) => {
                if (data.success) {
                    this._pendingTrips = data.data;
                }
                return data;
            }
        );
    }

    updatePendingTrips(): Observable<any> {
        const subject = new Subject();
        this.socket.on('pending trips', data => {
            LogUtil.ConsoleNag(`GOT NEW PENDING TRIPS: ${data.length}`);
            if (data.success) {
                this._pendingTrips = data.data;
            }
            subject.next(data);
        });
        return from(subject);
    }

    forgottenPendingTripsNotifier(): Observable<any> {
        const subject = new Subject();
        this.socket.on('notification', data => {
            LogUtil.ConsoleNag(`NOTIFICATION RECEIVED${data.data}`);
            subject.next(data);
        });
        return from(subject);
    }

    echoNotification(id: string) {
        LogUtil.ConsoleNag('NOTIFICATION ECHOED: ');
        this.socket.emit('notified', {
            id: id
        });
    }

    // get accepted trips
    getAcceptedTrips(): Promise<ServerResponse> {
        return this.http.get<any>(UrlConfig.TRIP_URL__ACCEPTED).toPromise().then(
            (data: ServerResponse) => {
                if (data.success) {
                    this._acceptedTrips = data.data;
                }
                return data;
            }
        );
    }

    updateAcceptedTrips(): Observable<any> {
        const subject = new Subject();
        this.socket.on('accepted trips', data => {
            if (data.success) {
                this._acceptedTrips = data.data;
            }
            subject.next(data);
        });
        return from(subject);
    }

    // get arrived trips
    getArrivedTrips(): Promise<ServerResponse> {
        return this.http.get<any>(UrlConfig.TRIP_URL__ARRIVED).toPromise().then(
            (data: ServerResponse) => {
                if (data.success) {
                    this._arrivedTrips = data.data;
                }
                return data;
            }
        );
    }

    updateArrivedTrips(): Observable<any> {
        const subject = new Subject();
        this.socket.on('arrived trips', data => {
            if (data.success) {
                this._arrivedTrips = data.data;
            }
            subject.next(data);
        });
        return from(subject);
    }

    // get completed trips
    getCompletedTrips(): Promise<ServerResponse> {
        return this.http.get<any>(UrlConfig.TRIP_URL__COMPLETED).toPromise().then(
            (data: ServerResponse) => {
                if (data.success) {
                    this._completedTrips = data.data;
                }
                return data;
            }
        );
    }

    updateCompletedTrips(): Observable<any> {
        const subject = new Subject();
        this.socket.on('completed trips', data => {
            if (data.success) {
                this._completedTrips = data.data;
            }
            subject.next(data);
        });
        return from(subject);
    }

    // get started trips
    getStartedTrips(): Promise<ServerResponse> {
        return this.http.get<any>(UrlConfig.TRIP_URL__STARTED).toPromise().then(
            (data: ServerResponse) => {
                if (data.success) {
                    this._startedTrips = data.data;
                }
                return data;
            }
        );
    }

    updateStartedTrips(): Observable<any> {
        const subject = new Subject();
        this.socket.on('started trips', data => subject.next(data));
        return from(subject);
    }

    // get scheduled trips
    getScheduledTrips(): Trip[] {
        return this.pendingTrips.filter(tr => tr.is_scheduled);
    }

    // get day's trips
    getDayTrips(): Observable<ServerResponse> {
        return this.http.get<any>(UrlConfig.TRIP_URL__REPORT__DAY);
    }

    // search by customer name
    getTripsByCustomerName(customerName: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_URL, {
            params: {
                customer_name: customerName
            }
        });
    }

    // search by driver id
    getTripsByDriverId(driverId: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_URL, {
            params: {
                driver_id: driverId
            }
        });
    }

     // search by dispathcer id
     getTripsByDispatcherId(dispatcherId: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_BY_DISPATCHER_URL, {
            params: {
                dispatcher_id: dispatcherId
            }
        });
    }

    // search by driver name
    getTripsByDriverName(driverName: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_URL, {
            params: {
                driver_name: driverName
            }
        });
    }

    // search by starting location
    getTripsByStartingLocationName(startingLocationName: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_URL, {
            params: {
                starting_location: startingLocationName
            }
        });
    }

    // search by destination location
    getTripsByDestinationLocationName(destinationLocationName: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_URL, {
            params: {
                destination_location: destinationLocationName
            }
        });
    }

    getTripsByLocationNames(startingLocationName: string, destinationLocationName: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_URL, {
            params: {
                destination_location: destinationLocationName,
                starting_location: startingLocationName
            }
        });
    }

    getTripsByLocationsAndCustomerName(startingLocationName: string, destinationLocationName: string,
                                       customerName: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_URL, {
            params: {
                customer_name: customerName,
                destination_location: destinationLocationName,
                starting_location: startingLocationName
            }
        });
    }

    getTripsByLocationAndDriverName(startingLocationName: string, destinationLocationName: string,
                                    driverName: string): Observable<any> {
        return this.http.get<any>(UrlConfig.SEARCH_TRIP_URL, {
            params: {
                driver_name: driverName,
                destination_location: destinationLocationName,
                starting_location: startingLocationName
            }
        });
    }

    // export trips
    exportTrips() {
        return this.http.get(UrlConfig.EXPORT_URL__TRIP, {
            responseType: 'blob'
        });
    }

    // get trips between two timestamps
    getTripsBetweenTimestamps(startTimestamp, endTimestamp): Observable<any> {
        return this.http.get<any>(UrlConfig.TRIP_URL + '/report/' + startTimestamp + '/' + endTimestamp);
    }


    get pendingTrips(): Trip[] {
        return this._pendingTrips;
    }

    get acceptedTrips(): Trip[] {
        return this._acceptedTrips;
    }

    get arrivedTrips(): Trip[] {
        return this._arrivedTrips;
    }

    get completedTrips(): Trip[] {
        return this._completedTrips;
    }

    get startedTrips(): Trip[] {
        return this._startedTrips;
    }
}
