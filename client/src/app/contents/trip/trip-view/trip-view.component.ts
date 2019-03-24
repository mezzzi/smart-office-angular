import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatPaginator, MatTableDataSource} from '@angular/material';
import {Trip, User} from '../../../shared/models';
import {AuthService, TripService, UserService} from '../../../shared/services';
import {LogUtil} from '../../../shared/utils';
import {SelectionModel} from '@angular/cdk/collections';
import {TripDetailsComponent} from '../trip-details/trip-details.component';
import {TripStatus} from '../../../shared/configs';
import {ServerResponse} from '../../../shared/interfaces';
import {HttpErrorResponse} from '@angular/common/http';
import {switchMap} from 'rxjs/operators';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {of} from 'rxjs/internal/observable/of';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {FormControl} from '@angular/forms';
import * as _moment from 'moment';

@Component({
    selector: 'app-trip-view',
    templateUrl: './trip-view.component.html',
    styleUrls: ['./trip-view.component.scss']
})
export class TripViewComponent implements OnInit {

    private trips: Trip[] = [];
    dataSource: MatTableDataSource<Trip>;
    selection = new SelectionModel<Trip>(true, []);

    loaded = false;
    displayedColumns = ['select', 'customer_name', 'price', 'credit', 'trip_status', 'collected'];
    columnNames = [
        {
            value: 'customer_name',
            name: 'Customer Name'
        },
        {
            value: 'customer_phone',
            name: 'Customer Phone'
        },
        {
            value: 'starting_location',
            name: 'Starting Location'
        },
        {
            value: 'destination_location',
            name: 'Destination Location'
        },
        {
            value: 'driver_name',
            name: 'Driver Name'
        },
        {
            value: 'trip_status',
            name: 'Trip Status'
        },
        {
            value: 'price',
            name: 'Trip Price'
        },
        {
            value: 'night',
            name: 'Is Night'
        },
        {
            value: 'credit',
            name: 'Is Credit'
        },
        {
            value: 'collected',
            name: 'Is Collected'
        },
        {
            name: 'Collected Date',
            value: 'collected_time'
        },
        {
            name: 'Kilometer',
            value: 'km'
        },
        {
            name: 'Waiting Time',
            value: 'waiting_time'
        },
        {
            name: 'Commission',
            value: 'commission'
        },
        {
            name: 'Company Name',
            value: 'company_name'
        },
        {
            name: 'Driver Card',
            value: 'card_number_driver'
        },
        {
            name: 'Customer Card',
            value: 'card_number_customer'
        },
        {
            name: 'Call Time',
            value: 'call_time'
        },
        {
            name: 'Confirmation Time',
            value: 'confirmation'
        },
        {
            name: 'Arrival Time',
            value: 'time_added'
        },
        {
            name: 'Starting Time',
            value: 'start'
        },
        {
            name: 'Cancellation Code',
            value: 'cancellation_code'
        },
        {
            name: 'Cancellation Time',
            value: 'time_cancelled'
        },
        {
            name: 'Dispatcher Name',
            value: 'dispatcher'
        }
    ];
    private driverId: string;
    private driver: User;

    constructor(private tripService: TripService,
                private authService: AuthService,
                private dialog: MatDialog, private route: ActivatedRoute,
                private userService: UserService) {
    }

    @ViewChild(MatPaginator) paginator: MatPaginator;
    private totalCredit = 0;
    private totalCash = 0;
    private balance = 0;
    private oneDay = 1000 * 60 * 60 * 24;
    private startDate = new FormControl(Date.now() - this.oneDay);
    private endDate = new FormControl(Date.now());
    private maxDate = new Date(Date.now() + this.oneDay);

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap((params: ParamMap) => {
                if (!params.get('id')) {
                    return of(false);
                }
                LogUtil.ConsoleNag('ID: ' + params.get('id'));
                return of(params.get('id'));
            })
        ).subscribe(
            (id: any) => {
                LogUtil.ConsoleNag(`WHAt IS ID: ${id}`);

                this.driverId = id;
                this.refreshTable(id);
            },
            error => LogUtil.ConsoleNag('ID DATA IS: ' + JSON.stringify(error))
        );
        this.startDate.valueChanges.subscribe(data => {
            this.tripService.getTripsBetweenTimestamps(_moment(data, 'd:m:y A').toDate(),
                _moment(this.endDate.value ? new Date(this.endDate.value) : new Date(Date.now()), 'd:m:y A').toDate()).toPromise()
                .then(_data => {
                    LogUtil.ConsoleNag(`START DATE SUBSCRIBER CALLED: data LEN: ${_data.data.length}`);
                    _data.data = _data.data.filter(trip => trip.driver._id === this.driverId);
                    this.trips = _data.data;
                    this.reload();
                });
        });
        this.endDate.valueChanges.subscribe(data => {
            this.tripService.getTripsBetweenTimestamps(
                _moment(this.startDate.value ? new Date(this.startDate.value) : new Date(Date.now()),
                    'd:m:y A').toDate(),
                _moment(data, 'd:m:y A').toDate()).toPromise()
                .then(_data => {
                    LogUtil.ConsoleNag(`END DATE SUBSCRIBER CALLED: data LEN: ${_data.data.length}`);
                    _data.data = _data.data.filter(trip => trip.driver._id === this.driverId);
                    this.trips = _data.data;
                    this.reload();
                });
        });
    }

    refreshTable(driverId?: string) {
        const tripFilter = tr => {
            return !!tr.driver && (!!driverId ? tr.driver._id === driverId : true) &&
                tr.trip_status !== TripStatus.CANCELLED;
        };
        this.totalCredit = 0.0;
        if (driverId) {
            LogUtil.ConsoleNag('name: ' + driverId);
            this.userService.getDriverById(driverId).toPromise()
                .then(data => {
                    this.driver = data.data;
                })
                .then(() => this.tripService.getTripsByDriverId(driverId).toPromise())
                .then(resp => {
                    this.trips = resp.data;
                    this.reload();
                })
                .catch((errResp: HttpErrorResponse) => LogUtil.AlertNag(errResp.error));
        } else {
            this.tripService.getTrips().toPromise()
                .then(resp => {
                    LogUtil.ConsoleNag(`YES NO DRIVER ID: AND TRIPS LENGTH: ${resp.data.length}`);
                    this.trips = resp.data.filter(tripFilter);
                    LogUtil.ConsoleNag(`YES NO DRIVER ID: AND TRIPS LENGTH: ${this.trips.length}`);
                    if (this.trips.length > 0) {
                        LogUtil.ConsoleNag(JSON.stringify(this.trips[0].driver));
                    }
                    this.reload();
                })
                .catch((errResp: HttpErrorResponse) => LogUtil.AlertNag(errResp.error));
        }
    }

    reload() {
        LogUtil.ConsoleNag('RELOADING');
        this.updateTotal(true);
        this.dataSource = new MatTableDataSource(this.trips);
        this.dataSource.filterPredicate = (data, filter: string) => {
            const accumulator = (currentTerm, key) => {
                switch (key) {
                    case 'customer':
                        return currentTerm + data.customer.name + data.customer.phone;
                    case 'driver':
                        return !!data.driver ? currentTerm + data.driver.name + data.driver.phone : currentTerm;
                    case 'starting_location':
                        return currentTerm + data.starting_location.name;
                    case 'destination_location':
                        return currentTerm + data.destination_location.name;
                    default:
                        return currentTerm + data[key];
                }
            };
            const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
            // Transform the filter by converting it to lowercase and removing whitespace.
            const transformedFilter = filter.trim().toLowerCase();
            return dataStr.indexOf(transformedFilter) !== -1;
        };
        this.dataSource.paginator = this.paginator;
        this.loaded = true;
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // DataSource defaults to lowercase matches
        this.dataSource.filter = filterValue;
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numSelectable = this.dataSource.data.filter(row => this.isSelectable(row)).length;
        return numSelected === numSelectable;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => {
                if (this.isSelectable(row)) {
                    this.selection.select(row);
                }
            });
    }

    isSelectable(row: Trip): boolean {
        return row.trip_status === TripStatus.ARRIVED && !row.collected;
    }

    colChanged($event: any, index: number) {
        LogUtil.ConsoleNag(`vlaue: ${$event.value}, index: ${index}`);
        const oldValue = this.displayedColumns[index];
        const newValue = $event.value;
        const otherIndex = this.displayedColumns.indexOf(newValue);
        this.displayedColumns[index] = newValue;
        if (otherIndex !== -1) {
            this.displayedColumns[otherIndex] = oldValue;
        }
    }

    getColValue(trip: Trip, index: number) {
        const value = this.displayedColumns[index];
        const dates = ['call_time', 'confirmation', 'start', 'time_added',
            'time_cancelled', 'collected_time', 'schedule_date'];
        switch (value) {
            case 'customer_name':
                return trip.customer.name;
            case 'customer_phone':
                return trip.customer.phone;
            case 'starting_location':
                return trip.starting_location.name;
            case 'destination_location':
                return trip.destination_location.name;
            case 'driver_name':
                return trip.driver ? trip.driver.name : '';
            case 'night':
                return trip.night ? 'NIGHT' : 'DAY';
            case 'credit':
                return trip.credit ? 'CREDIT' : 'CASH';
            case 'collected':
                return trip.collected ? 'COLLECTED' : 'UNCOLLECTED';
            case 'commission':
                return 'SAY WHAT';
            case 'company_name':
                return trip.customer.attached_corporate;
            case 'card_number_driver':
                return trip.driver.card_number;
            case 'card_number_customer':
                return trip.customer.card_number;
            case 'dispatcher':
                return trip.accepted_by.name;
            default:
                const defaultValue = trip[value] || '';
                if (dates.indexOf(value) === -1) {
                    return defaultValue;
                } else {
                    return !defaultValue ? '' : (isNaN(Number(defaultValue)) ? new Date(defaultValue).toDateString() :
                        new Date(Number(defaultValue)).toDateString());
                }

        }
    }

    getColor(trip: Trip, i: number): string {
        const colName = this.displayedColumns[i];
        if (colName === 'collected') {
            return trip.collected ? 'blue' : 'red';
        } else {
            return 'black';
        }
    }

    updateTotal(noneSelected: boolean) {
        const selectedRows = noneSelected ? this.trips : this.selection.selected;
        const collectIds: string[] = [];
        this.totalCredit = 0;
        this.totalCash = 0;
        this.balance = 0;
        for (const row of selectedRows) {
            if (row.trip_status !== TripStatus.ARRIVED || row.collected) {
                continue;
            }
            const price = parseFloat(row.price);
            if (row.credit) {
                this.totalCredit += price;
            } else {
                this.totalCash += price;
            }
        }
        this.balance = 0.9 * this.totalCredit - 0.1 * this.totalCash;

    }

    getPlaceHolder(index: number): string {
        const name = this.displayedColumns[index];
        const target = this.columnNames.filter(name_val => name_val.value === name)[0];
        return !!target ? target.name : '';
    }

    getFooterPrice(index: number) {
        if (index === 1) {
            return this.balance;
        } else if (index === 3) {
            return this.totalCredit;
        } else if (index === 5) {
            return this.totalCash;
        } else {
            return '';
        }
    }

    getFooterLabel(index: number) {
        if (index === 1) {
            return 'Balance: ';
        } else if (index === 3) {
            return 'Credit: ';
        } else if (index === 5) {
            return 'Cash: ';
        } else {
            return '';
        }
    }

    getETB(index: number) {
        if (index === 1 || index === 3 || index === 5) {
            return 'ETB';
        } else {
            return '';
        }
    }

    showCollectOption(): boolean {
        return this.selection.selected.length > 0;
    }

    showEditOption(): boolean {
        return this.selection.selected.length === 1;
    }

    editTrip() {
        LogUtil.ConsoleNag('about to edit a trip');
        this.launchEditDialog(this.selection.selected[0]);
    }

    doCollect() {
        const selectedRows = this.selection.selected;
        let numUpdated = 0;
        for (const row of selectedRows) {
            row.collected = true;
            row.collected_by = this.authService.getAuthUser();
            row.collected_time = new Date();
            this.tripService.updateTrip(row._id, row).then((resp: ServerResponse) => {
                if (resp.success) {
                    LogUtil.ConsoleNag('COLLECTED SUCCESSFULLY UPDATED');
                    numUpdated++;
                    if (numUpdated === selectedRows.length) {
                        this.refreshTable();
                    }
                } else {
                    LogUtil.AlertNag(JSON.stringify(resp));
                }
            }).catch((errorResp: HttpErrorResponse) => {
                LogUtil.AlertNag(JSON.stringify(errorResp.error));
            });
        }
    }

    launchEditDialog(trip: Trip) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = false;
        dialogConfig.width = '80vw';
        dialogConfig.data = trip;
        const secondDialogRef = this.dialog.open(TripDetailsComponent, dialogConfig);
        secondDialogRef.afterClosed().subscribe(() => {
            this.refreshTable(this.driverId);
        });
    }
}
