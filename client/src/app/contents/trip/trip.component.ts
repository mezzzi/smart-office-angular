import {Component, Inject, OnInit} from '@angular/core';
import {MainService, TripService, UserService} from '../../shared/services';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material';
import {RideComponent} from '../ride/ride.component';
import {Trip} from '../../shared/models';
import {ServerResponse, TripFormResult} from '../../shared/interfaces';
import {getTripStatus, TripStatus} from '../../shared/configs';
import {handleError, LogUtil} from '../../shared/utils';
import {SearchTripComponent} from './search-trip/search-trip.component';
import {HttpService} from '../../shared/services/http.service';
import {HttpErrorResponse} from '@angular/common/http';
import {makeAvatarUrl} from '../../shared/utils/string.util';
import {timer} from 'rxjs';

@Component({
    selector: 'app-notify-pending',
    styles: [`
        #notification-title {
            text-align: center;
            margin-bottom: 5px;
        }

        #notification-btns {
            text-align: center;
            display: flex;
            justify-content: center;
        }
    `],
    template: `
        <h2 mat-dialog-title id="notification-title">{{isScheduled ? 'Scheduled Trip Notification' : 'Idle Trip Notification'}}</h2>
        <mat-dialog-content id="notification-content">
            <p id="notification-msg">
                {{isScheduled ? 'You have a pending trip scheduled for today' : 'You have a trip left idle for over 10 minutes'}}</p>
        </mat-dialog-content>
        <mat-dialog-actions id="notification-btns">
            <button mat-raised-button class="mat-warn" (click)="onIgnoreClick()">Ignore</button>
            <button mat-raised-button class="mat-primary" (click)="onOpenClick()">Open</button>
        </mat-dialog-actions>
    `,
})
export class NotifyPendingTripComponent {
    constructor(
        public dialogRef: MatDialogRef<NotifyPendingTripComponent>,
        @Inject(MAT_DIALOG_DATA) public isScheduled: Boolean) {
    }

    onOpenClick(): void {
        this.dialogRef.close(true);
    }

    onIgnoreClick(): void {
        this.dialogRef.close(false);
    }
}

@Component({
    selector: 'app-trip',
    templateUrl: './trip.component.html',
    styleUrls: ['./trip.component.scss']
})
export class TripComponent implements OnInit {
    private readonly dialogConfig: MatDialogConfig;
    showAddTripButton = true;
    pendingTrips: Trip[] = [];
    acceptedTrips: Trip[] = [];
    startedTrips: Trip[] = [];
    arrivedTrips: Trip[] = [];
    completedTrips: Trip[] = [];
    // the trip that is currently being processed
    tripBeingProcessed: Trip;
    statusBgColors = {
        start: '#FFFFFF',
        medium: '#FFEBEE',
        close: '#EF9A9A',
        late: '#E57373'
    };
    private dialogRef: MatDialogRef<RideComponent, any>;
    COLORS = {
        'accepted': 'teal', 'cancelled': 'red',
        'started': 'magenta', 'arrived': 'orange',
        'completed': 'green', 'pending': 'blue'
    };
    private activeTripId: string;
    public isShowingProfile = false;

    constructor(private userService: UserService, private service: MainService, private httpService: HttpService,
                private tripService: TripService, private dialog: MatDialog) {
        this.tripService.getPendingTrips().then(
            res => {
                this.makeAvatarUrls(res.data);
                res.data.sort((a, b) => b.time_added - a.time_added);
                res.data.map(trip => {
                    this.httpService.getTimeStamp().then(data => {
                        const elapsedMinutes = new Date(new Date(data.data).getTime() -
                            new Date(trip.call_time).getTime()).getTime() / (60 * 1000);
                        if (elapsedMinutes < 2) {
                            trip.bg = this.statusBgColors.start;
                        } else if (elapsedMinutes < 3) {
                            trip.bg = this.statusBgColors.medium;
                        } else if (elapsedMinutes < 5) {
                            trip.bg = this.statusBgColors.close;
                        } else {
                            trip.bg = this.statusBgColors.late;
                        }
                    });
                });
                setInterval(() => {
                    res.data.map(trip => {
                        this.httpService.getTimeStamp().then(data => {
                            const elapsedMinutes = new Date(new Date(data.data).getTime() -
                                new Date(trip.call_time).getTime()).getTime() / (60 * 1000);
                            if (elapsedMinutes < 2) {
                                trip.bg = this.statusBgColors.start;
                            } else if (elapsedMinutes < 3) {
                                trip.bg = this.statusBgColors.medium;
                            } else if (elapsedMinutes < 5) {
                                trip.bg = this.statusBgColors.close;
                            } else {
                                trip.bg = this.statusBgColors.late;
                            }
                        });
                    });
                }, 60 * 1000);
                this.fillCustomerIfNull(res.data);
                this.pendingTrips = res.data;
                this.tripService.updatePendingTrips().subscribe(_res => {
                    _res.data.sort((a, b) => b.time_added - a.time_added);
                    this.fillCustomerIfNull(_res.data);
                    this.pendingTrips = _res.data;
                    this.makeAvatarUrls(_res.data);
                    _res.data.map(trip => {
                        this.httpService.getTimeStamp().then(data => {
                            const elapsedMinutes = new Date(new Date(data.data).getTime() -
                                new Date(trip.call_time).getTime()).getTime() / (60 * 1000);
                            if (elapsedMinutes < 2) {
                                trip.bg = this.statusBgColors.start;
                            } else if (elapsedMinutes < 3) {
                                trip.bg = this.statusBgColors.medium;
                            } else if (elapsedMinutes < 5) {
                                trip.bg = this.statusBgColors.close;
                            } else {
                                trip.bg = this.statusBgColors.late;
                            }
                        });

                    });
                    setInterval(() => {
                        _res.data.map(trip => {
                            this.httpService.getTimeStamp().then(data => {
                                const elapsedMinutes = new Date(new Date(data.data).getTime() -
                                    new Date(trip.call_time).getTime()).getTime() / (60 * 1000);
                                if (elapsedMinutes < 2) {
                                    trip.bg = this.statusBgColors.start;
                                } else if (elapsedMinutes < 3) {
                                    trip.bg = this.statusBgColors.medium;
                                } else if (elapsedMinutes < 5) {
                                    trip.bg = this.statusBgColors.close;
                                } else {
                                    trip.bg = this.statusBgColors.late;
                                }
                            });
                        });
                    }, 60 * 1000);
                });
            }
        );
        this.tripService.getAcceptedTrips().then(
            res => {
                this.makeAvatarUrls(res.data);
                res.data.sort((a, b) => b.time_added - a.time_added);

                this.fillCustomerIfNull(res.data);
                this.acceptedTrips = res.data;
                this.tripService.updateAcceptedTrips().subscribe(_res => {
                    if (_res.data.length > 0) {
                        _res.data.sort((a, b) => b.time_added - a.time_added);
                        this.makeAvatarUrls(_res.data);
                    }
                    this.fillCustomerIfNull(_res.data);
                    this.acceptedTrips = _res.data;
                });
            }
        );
        this.tripService.getStartedTrips().then(
            res => {
                this.makeAvatarUrls(res.data);
                res.data.sort((a, b) => b.time_added - a.time_added);
                this.fillCustomerIfNull(res.data);
                this.startedTrips = res.data;
                this.tripService.updateStartedTrips().subscribe(_res => {
                    if (_res.data.length > 0) {
                        _res.data.sort((a, b) => b.time_added - a.time_added);
                        this.makeAvatarUrls(_res.data);
                    }
                    this.fillCustomerIfNull(_res.data);
                    this.startedTrips = _res.data;
                });
            }
        );
        this.tripService.getArrivedTrips().then(
            res => {
                this.makeAvatarUrls(res.data);
                res.data.sort((a, b) => b.time_added - a.time_added);
                this.fillCustomerIfNull(res.data);
                this.arrivedTrips = res.data;
                console.log(this.arrivedTrips);
                this.tripService.updateArrivedTrips().subscribe(_res => {
                    if (_res.data.length > 0) {
                        _res.data.sort((a, b) => b.time_added - a.time_added);
                        this.makeAvatarUrls(_res.data);
                    }
                    this.fillCustomerIfNull(_res.data);
                    this.arrivedTrips = _res.data;
                });
            }
        );
        this.tripService.getCompletedTrips().then(
            res => {
                this.makeAvatarUrls(res.data);
                res.data.sort((a, b) => b.time_added - a.time_added);
                this.fillCustomerIfNull(res.data);
                this.completedTrips = res.data;
                this.tripService.updateCompletedTrips().subscribe(_res => {
                    if (_res.data.length > 0) {
                        _res.data.sort((a, b) => b.time_added - a.time_added);
                        this.makeAvatarUrls(_res.data);
                    }
                    this.fillCustomerIfNull(_res.data);
                    this.completedTrips = _res.data;
                });
            }
        );
        this.tripService.forgottenPendingTripsNotifier().subscribe(res => {
            const trip: Trip = res.data;
            trip.notified = true;
            trip.last_notified = new Date().toString();
            LogUtil.ConsoleNag('NOTIFIED: ' + trip.notified);
            trip.customer.password = '8707';
            this.tripService.updateTrip(trip._id, trip).then(
                (response: ServerResponse) => {
                    if (response.success) {
                        LogUtil.ConsoleNag('SUCCESSFULLY UPDATED INSIDE FORGOTTEN TRIP OBSERVER');
                        const latestTrip: Trip = response.data;
                        this.launchNotificationDialog(latestTrip._id, latestTrip.is_scheduled);
                    }
                },
                (errorResponse: HttpErrorResponse) => {
                    LogUtil.AlertNag(JSON.stringify(errorResponse.error));
                    handleError(errorResponse);
                }
            );
        });
        this.tripService.listenForFilteredTripDisplayRequest().subscribe((tr: Trip) => {
            if (tr !== null) {
                this.displayTrip(tr.trip_status, tr._id);
            }
        });
        this.userService.getIsShowingProfile().subscribe(
            (isShowing: boolean) => {
                LogUtil.ConsoleNag(`IS SHOWING IS: ${isShowing}`);
                this.isShowingProfile = isShowing;
            }
        );
        this.dialogConfig = new MatDialogConfig();
        this.dialogConfig.disableClose = true;
        this.dialogConfig.autoFocus = true;
        this.dialogConfig.hasBackdrop = false;
        this.dialogConfig.position = {
            bottom: '5px',
            left: '255px'
        };
    }

    fillCustomerIfNull(trips: Trip[]) {
        trips.forEach(tr => {
            if (!tr.customer) {
                tr.customer = {
                    name: '',
                    phone: ''
                };
            }
            if (tr.trip_status !== TripStatus.PENDING && !tr.driver) {
                tr.driver = {
                    name: '',
                    phone: ''
                };
            }
        });
    }

    ngOnInit() {
    }

    startSearch() {
        console.log('CALLED');
    }

    makeAvatarUrls(data) {
        data.map(trip => {
            if (trip.received_by) {
                trip.received_by.avatar_url = makeAvatarUrl(trip.received_by.avatar_url);
            }
            if (trip.accepted_by) {
                trip.accepted_by.avatar_url = makeAvatarUrl(trip.accepted_by.avatar_url);
            }
            if (trip.started_by) {
                trip.started_by.avatar_url = makeAvatarUrl(trip.started_by.avatar_url);
            }
        });
    }

    launchNotificationDialog(id: string, isScheduled: boolean) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = false;
        dialogConfig.width = '300px';
        dialogConfig.height = '200px';
        dialogConfig.position = {
            bottom: '200px',
            left: '550px'
        };
        dialogConfig.data = isScheduled;
        const secondDialogRef = this.dialog.open(NotifyPendingTripComponent, dialogConfig);
        secondDialogRef.afterClosed().subscribe((open: boolean) => {
            if (open) {
                const tripToShow = this.getTrip(TripStatus.PENDING, id);
                tripToShow.isSaved = true;
                this.showTripForm(tripToShow);
            }
            this.tripService.echoNotification(id);
        });
    }

    showTripForm(trip: Trip) {
        this.activeTripId = trip._id;
        this.tripBeingProcessed = trip;
        this.dialogConfig.data = trip;
        this.showAddTripButton = false;
        if (this.dialogRef) {
            this.dialogRef.close();
        }
        this.dialogRef = this.dialog.open(RideComponent, this.dialogConfig);
        this.dialogRef.afterOpen().subscribe(() => {
            this.showAddTripButton = false;
        });
        this.dialogRef.afterClosed().subscribe((result: TripFormResult) => {
            this.showAddTripButton = true;
            this.activeTripId = '';
            if (!result.isIgnored) {
                if (result && result.formTrip) {
                    this.tripUpdateCallBack(result);
                }
            }
        });
    }

    showSearchDialog() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = false;
        dialogConfig.position = {
            top: '70px',
            left: '255px'
        };
        this.dialog.open(SearchTripComponent, dialogConfig);
    }

    tripUpdateCallBack(result: TripFormResult): void {
        const updatedTrip = result.formTrip;
        if (updatedTrip.trip_status === TripStatus.CANCELLED) {
            this.tripService.cancelTrip(updatedTrip._id, updatedTrip.cancellation_code).then(
                (response: ServerResponse) => {
                    if (response.success) {
                        LogUtil.ConsoleNag('SUCCESSFULLY DELETED');
                    }
                },
                (errorResponse: HttpErrorResponse) => {
                    LogUtil.AlertNag(JSON.stringify(errorResponse.error));
                    handleError(errorResponse);
                }
            );
        } else if (updatedTrip.isSaved) {
            delete updatedTrip.isSaved;
            if (updatedTrip.notified) {
                updatedTrip.last_notified = Date.now() + '';
            }
            this.tripService.updateTrip(updatedTrip._id, updatedTrip).then(
                (response: ServerResponse) => {
                    if (response.success) {
                        LogUtil.ConsoleNag('SUCCESSFULLY UPDATED');
                    }
                },
                (errorResponse: HttpErrorResponse) => {
                    LogUtil.AlertNag(JSON.stringify(errorResponse.error));
                    handleError(errorResponse);
                }
            );
        } else {
            delete updatedTrip._id;
            delete updatedTrip.isSaved;
            updatedTrip.customer.password = updatedTrip.customer.password || '8707';
            this.tripService.addTrip(updatedTrip).then(
                (response: ServerResponse) => {
                    if (response.success) {
                        LogUtil.ConsoleNag('SUCCESSFULLY SAVED');
                    }
                },
                (errorResponse: HttpErrorResponse) => {
                    LogUtil.AlertNag(JSON.stringify(errorResponse.error));
                    handleError(errorResponse);
                }
            );
        }
    }

    addNewTrip() {
        const trip = new Trip();
        trip._id = Date.now().toString();
        trip.isSaved = false;
        trip.trip_status = TripStatus.PRE_PENDING;
        this.httpService.getTimeStamp().then(response => {
            trip.call_time = response.data;
            LogUtil.ConsoleNag(JSON.stringify(trip));
            this.showTripForm(trip);
        }).catch((error: HttpErrorResponse) => {
            LogUtil.ConsoleNag(JSON.stringify(error.error));
            LogUtil.ConsoleNag('Could not fetch timestamp INSIDE ADD NEW TRIP');
        });
    }

    getTrip(tripStatusString: string, id: string): Trip {
        const tripStatus = getTripStatus(tripStatusString);
        let tripArray;
        switch (tripStatus) {
            case TripStatus.PENDING:
                tripArray = this.pendingTrips;
                break;
            case TripStatus.ACCEPTED:
                tripArray = this.acceptedTrips;
                break;
            case TripStatus.STARTED:
                tripArray = this.startedTrips;
                break;
            case TripStatus.ARRIVED:
                tripArray = this.arrivedTrips;
                break;
            case TripStatus.COMPLETED:
                tripArray = this.completedTrips;
                break;
            default:
                LogUtil.AlertNag(`Invalid trip status inside getTrip: ${tripStatusString}`);
                return null;
        }
        return tripArray.filter(trip => trip._id === id)[0];
    }

    displayTrip(tripStatusString: string, id: string) {
        const tripToShow = this.getTrip(tripStatusString, id);
        if (!!tripToShow) {
            tripToShow.isSaved = true;
            if (!this.showAddTripButton && this.tripBeingProcessed && this.tripBeingProcessed._id === id) {
                this.activeTripId = '';
                this.dialogRef.close();
            } else {
                this.showTripForm(tripToShow);
            }
        }

    }

}
