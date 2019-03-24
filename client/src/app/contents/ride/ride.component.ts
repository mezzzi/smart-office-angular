import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef, MatTableDataSource} from '@angular/material';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {Location, Trip, User} from '../../shared/models';
import {NavigationStart, Router} from '@angular/router';
import {CancellationCode, getCancellationCode, getCancellationLabel, getLevel, Level, RouteConfig, TripStatus} from '../../shared/configs';
import {AuthService, LocationService, TripService, UserService} from '../../shared/services';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {handleError, LogUtil} from '../../shared/utils';
import {ServerResponse, TripFormResult} from '../../shared/interfaces';
import {HttpService} from '../../shared/services/http.service';
import {DriverStatus, getDriverStatus} from '../../shared/configs/driver.status.config';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// @ts-ignore
import * as _moment from 'moment';
// @ts-ignore
import {default as _rollupMoment} from 'moment';
import {HttpErrorResponse} from '@angular/common/http';
import {CorporateClient} from '../../shared/models/corporate.client.model';
import {CorporateClientService} from '../../shared/services/corporate.client.service';
import {DisputeComponent} from '../dispute/dispute.component';

interface CorporateGroup {
    letter: string;
    corporates: CorporateClient[];
}

const _filter = (opt: CorporateClient[], value: string): CorporateClient[] => {
    if (typeof value === 'string') {
        const filterValue = value.toLowerCase();
        return opt.filter(item => item.name.toLowerCase().indexOf(filterValue) !== -1);
    } else {
        LogUtil.ConsoleNag(`Mr anti-social awkward type is: ${typeof value}`);
        return opt;
    }
};

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'LL',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-cancel-trip',
    styles: [`
        #notification-title {
            text-align: center;
            margin-bottom: 5px;
        }

        #notification-btns, #notification-content {
            text-align: center;
            display: flex;
            justify-content: center;
        }
    `],
    template: `
        <h2 *ngIf="confirmed" mat-dialog-title id="notification-title">Confirm Cancel</h2>
        <mat-dialog-content id="notification-content">
            <p id="notification-msg" *ngIf="!confirmed">Are you sure you want to cancel the trip?</p>
            <mat-form-field *ngIf="confirmed">
                <mat-select [(ngModel)]="cancellation_code" placeholder="Reason For Cancel">
                    <mat-option *ngFor="let code of codes" [value]="code">
                        {{getCodeLabel(code.toString())}}
                    </mat-option>
                </mat-select>
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions id="notification-btns">
            <button *ngIf="!confirmed" mat-raised-button class="mat-primary" (click)="onNoClick()">No</button>
            <button *ngIf="!confirmed" mat-raised-button class="mat-warn" (click)="onYesClick()">Yes</button>
            <button *ngIf="confirmed" mat-raised-button class="mat-primary" (click)="onNoClick()">Cancel</button>
            <button *ngIf="confirmed" mat-raised-button class="mat-warn" (click)="onConfirm()">Confirm</button>
        </mat-dialog-actions>
    `
})
export class CancelTripComponent {
    constructor(
        public dialogRef: MatDialogRef<CancelTripComponent>,
        @Inject(MAT_DIALOG_DATA) public cancelCode: CancellationCode
    ) {
    }

    codes: CancellationCode[] = [
        CancellationCode.CUB_NOT_FOUND,
        CancellationCode.CUSTOMER_CANCEL_REQUEST,
        CancellationCode.CUSTOMER_NOT_RESPONDING,
        CancellationCode.DRIVER_CANCEL_REQUEST,
        CancellationCode.DRIVER_LATE,
        CancellationCode.DRIVER_LOST_CUSTOMER,
        CancellationCode.DISPATCHER_LAPSE
    ];
    confirmed = false;
    cancellation_code: string;

    // noinspection JSMethodCanBeStatic
    getCodeLabel(code: string): string {
        return getCancellationLabel(code);
    }

    onYesClick(): void {
        this.confirmed = true;
    }

    onNoClick(): void {
        this.confirmed = false;
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.dialogRef.close(this.cancellation_code);
    }
}

@Component({
    selector: 'app-ride',
    templateUrl: './ride.component.html',
    styleUrls: ['./ride.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ]
})
export class RideComponent implements OnInit {
    tripForm: FormGroup;
    originalTrip: Trip;
    corporateGroups: CorporateGroup[];
    corporateGroupOptions: Observable<CorporateGroup[]>;
    searchedNameCustomers: User[];
    searchedPhoneCustomers: User[];
    searchedNameDrivers: User[];
    searchedPhoneDrivers: User[];
    searchedLocations: Location[];
    COLORS = {
        'accepted': 'teal', 'cancelled': 'red',
        'started': 'magenta', 'arrived': 'orange',
        'completed': 'green', 'pending': 'blue'
    };
    show_history_table = false;
    corporateToggled = false;
    tripHistoryDisplayedColumns = [
        'trip_status',
        'pickup',
        'destination',
        'driver'
    ];
    tripHistoryDataSource: MatTableDataSource<Trip>;
    history: Trip[];
    homeOrWorkAddressAvailable = false;
    private cancellationCode: string;
    showSchedulingFields = false;
    showSchedulingToggle = false;
    showCreditCustomerField = false;
    scheduled_time: string;
    public LABEL_COLORS = {
        'accepted': 'teal', 'cancelled': 'red',
        'started': 'magenta', 'arrived': 'orange',
        'completed': 'green', 'pending': 'blue'
    };
    late = false;
    waitingTime = 0;
    timeStampDate: Date;
    timeStampTime: string;
    private submitted = false;
    private selectedCorporate: CorporateClient;
    private readonly DAY_BASE_PRICE = 40;
    private readonly NIGHT_BASE_PRICE = 30;
    private readonly DAY_RATE = 13;
    private readonly NIGHT_RATE = 19.5;
    private readonly WAITING_RATE = 2;

    constructor(
        private cdr: ChangeDetectorRef,
        private router: Router,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<RideComponent>,
        private disputeDialog: MatDialogRef<DisputeComponent>,
        private authService: AuthService,
        private userService: UserService,
        private corporateClientService: CorporateClientService,
        private locationService: LocationService,
        private httpService: HttpService,
        private dialog: MatDialog,
        private tripService: TripService,
        @Inject(MAT_DIALOG_DATA) trip: Trip
    ) {
        this.dialogRef.beforeClose()
            .subscribe(() => {
                if (!this.submitted) {
                    this.submitTrip(false, false);
                }
            });
        router.events
            .forEach(event => {
                if (event instanceof NavigationStart) {
                    LogUtil.ConsoleNag('ROUTER EVENT CALLED');
                    if (event.url !== RouteConfig.ROUTE_TRIP) {
                        LogUtil.ConsoleNag('TRIP SUBMITTED');
                        this.dialogRef.close();
                        // this.submitTrip(false, false);
                    }
                }
            })
            .catch(err => console.log(err));
        this.originalTrip = trip;
        this.scheduled_time = moment(this.originalTrip.scheduled_date).format('hh:mm A') || '';
        if (this.isSupervisorManaging) {
            this.setCustomTimeStampDefaults();
        }
        this.selectedCorporate = this.originalTrip.customer ? this.originalTrip.customer.attached_corporate : null;
        this.corporateToggled = this.originalTrip.is_corporate;
        this.showCreditCustomerField = this.originalTrip.credit;
        this.showSchedulingFields = this.originalTrip.is_scheduled || false;
        this.showSchedulingToggle = this.originalTrip.trip_status === TripStatus.PRE_PENDING ||
            this.originalTrip.trip_status === TripStatus.PENDING;
        this.tripHistoryDataSource = new MatTableDataSource([]);
        this.createForm();
        this.setWaitingTime();
        this.tripForm.markAsDirty();
        this.corporateClientService
            .getCorporates()
            .then((response: ServerResponse) =>
                this.handleCorporateSearchResponse(response)
            );
        this.httpService.getTimeStamp().then(data => {
            if (new Date(data.data).getHours() > 22) {
                this.late = true;
            }
        });

    }

    ngOnInit() {
    }

    // filter corporate group for auto fill
    private _filterGroup(value: string): CorporateGroup[] {
        if (value) {
            return this.corporateGroups
                .map(group => ({
                    letter: group.letter,
                    corporates: _filter(group.corporates, value)
                }))
                .filter(group => group.corporates.length > 0);
        }
        return this.corporateGroups;
    }

    // filter user  by phone for auto fill
    private _filterPhone(value: string, level: Level) {
        if (level === Level.CUSTOMER) {
            if (value === '') {
                this.searchedPhoneCustomers = [];
            } else {
                this.userService.setManagedUserLevel(Level.CUSTOMER);
                this.userService.getUserByPhone(value).subscribe(
                    response => {
                        this.searchedPhoneCustomers = response.data;
                    },
                    () => {
                        this.searchedPhoneCustomers = [];
                    }
                );
            }
        } else {
            if (value === '') {
                this.searchedPhoneDrivers = [];
            } else {
                this.userService.setManagedUserLevel(Level.DRIVER);
                this.userService.getUserByPhone(value).subscribe(
                    response => {
                        // LogUtil.ConsoleNag(
                        //     'DRIVERS: ' + JSON.stringify(response.data)
                        // );
                        this.searchedPhoneDrivers = response.data.filter(
                            (driver: User) =>
                                getDriverStatus(driver.driver_status) ===
                                DriverStatus.AVAILABLE
                        );
                        if (!this.originalTrip.driver) {
                            this.tripForm.get('driver.phone').setErrors({incorrect: true});
                        }
                    },
                    () => {
                        this.searchedPhoneDrivers = [];
                    }
                );
            }
        }
    }

    // filter user by name for auto fill
    private _filterName(value: string, level: Level) {
        if (level === Level.CUSTOMER) {
            if (value === '') {
                this.searchedNameCustomers = [];
            } else {
                this.userService.setManagedUserLevel(Level.CUSTOMER);
                this.userService.getUserByName(value).subscribe(
                    response => {
                        this.searchedNameCustomers = response.data;
                    },
                    () => {
                        this.searchedNameCustomers = [];
                    }
                );
            }
        } else {
            if (value === '') {
                this.searchedNameDrivers = [];
            } else {
                this.userService.setManagedUserLevel(Level.DRIVER);
                this.userService.getUserByName(value).subscribe(
                    response => {
                        this.searchedNameDrivers = response.data.filter(
                            (driver: User) =>
                                getDriverStatus(driver.driver_status) ===
                                DriverStatus.AVAILABLE
                        );
                        if (!this.originalTrip.driver) {
                            this.tripForm.get('driver.name').setErrors({incorrect: true});
                        }
                    },
                    () => {
                        this.searchedNameDrivers = [];
                    }
                );
            }
        }
    }

    // filter locations
    private _filterLocation(location: string) {
        if (location === '') {
            this.searchedLocations = [];
        } else {
            this.locationService
                .getLocationByName(location)
                .toPromise()
                .then((response: any) => {
                    this.searchedLocations = response.data;
                })
                .catch(() => (this.searchedLocations = []));
        }
    }

    // handle the toggle between a regular customer and a corporate customer
    checkCustomerType(event): void {
        this.corporateToggled = event.checked;
        this.selectedCorporate = this.corporateToggled ? this.selectedCorporate : null;
        LogUtil.ConsoleNag(`SELECTED CORPORATE: ${JSON.stringify(this.selectedCorporate)}`);
        this.tripForm.get('customer.attached_corporate').validator = this.corporateToggled ? Validators.required : null;
        this.tripForm.get('customer.attached_corporate').updateValueAndValidity();
    }

    // handle the toggle between scheduling and not scheduling a trip
    toggleSchedule(event): void {
        this.showSchedulingFields = event.checked;
        this.tripForm.get('scheduled_date').validator = this.showSchedulingFields ? Validators.required : null;
        this.tripForm.get('scheduled_date').updateValueAndValidity();
    }

    onPhoneChange(user: User, levelString: string) {
        const level = getLevel(levelString);
        if (level === Level.CUSTOMER) {
            const usr = this.searchedPhoneCustomers.filter(
                u => u._id === user._id
            )[0];
            this.handleUserChange(usr, level);
        } else if (level === Level.DRIVER) {
            const usr = this.searchedPhoneDrivers.filter(
                u => u._id === user._id
            )[0];
            this.handleUserChange(usr, level);
        }
    }

    onCorporateChange(corporate: CorporateClient) {
        this.selectedCorporate = corporate;
        this.tripForm.get('customer.attached_corporate').setValue(corporate.name);
    }

    onLocationChange(location: Location, startOrDestination: string) {
        LogUtil.ConsoleNag(`Location Selected: ${location.name}`);
        if (startOrDestination === 'start') {
            const locations = this.searchedLocations.filter(
                u => u._id === location._id
            )[0];
            this.tripForm.get('starting_location.name').setValue(locations.name);
            this.originalTrip.starting_location = location;
            this.searchedLocations = [];
        } else if (startOrDestination === 'destination') {
            const locations = this.searchedLocations.filter(
                u => u._id === location._id
            )[0];
            this.tripForm.get('destination_location.name').setValue(locations.name);
            this.originalTrip.destination_location = location;
            this.searchedLocations = [];
        }
    }

    onNameChange(user: User, levelString: string) {
        const level = getLevel(levelString);
        if (level === Level.CUSTOMER) {
            const usr = this.searchedNameCustomers.filter(
                u => u._id === user._id
            )[0];
            this.handleUserChange(usr, level);
        } else if (level === Level.DRIVER) {
            const usr = this.searchedNameDrivers.filter(
                u => u._id === user._id
            )[0];
            this.handleUserChange(usr, level);
        }
    }

    // can be used both by onNameChange and onPhoneChange
    handleUserChange(usr: User, level: Level) {
        if (level === Level.CUSTOMER) {
            this.originalTrip.customer = usr;
            this.tripForm.get('customer.phone').setValue(usr.phone);
            this.tripForm.get('customer.name').setValue(usr.name);
            this.tripForm.get('customer.card_number').setValue(usr.card_number);
            if (usr.attached_corporate) {
                this.selectedCorporate = usr.attached_corporate;
                this.corporateToggled = !!this.selectedCorporate;
                this.tripForm.get('customer.attached_corporate').setValue(
                    this.selectedCorporate ? this.selectedCorporate.name : ''
                );
            }
            // enable home/work selection if user has work or home address
            if (usr.address) {
                if (usr.address.home || usr.address.work) {
                    this.homeOrWorkAddressAvailable = true;
                    this.tripForm
                        .get('home_work')
                        .valueChanges.subscribe(val => {
                        if (usr.address[val]) {
                            this.tripForm
                                .get('starting_location')
                                .setValue(usr.address[val].name);
                        }
                    });
                    this.tripForm
                        .get('home_work_dest')
                        .valueChanges.subscribe(val => {
                        if (usr.address[val]) {
                            this.tripForm
                                .get('destination_location')
                                .setValue(usr.address[val].name);
                        }
                    });
                    this.tripForm
                        .get('starting_location')
                        .valueChanges.subscribe(val => {
                        if (
                            val !==
                            this.originalTrip.customer.address.home.name
                        ) {
                            this.tripForm.get('home_work').reset();
                        } else {
                            if (this.originalTrip.customer.address.work) {
                                if (
                                    val !==
                                    this.originalTrip.customer.address.work
                                ) {
                                    this.tripForm.get('home_work').reset();
                                }
                            }
                        }
                    });
                } else {
                    this.homeOrWorkAddressAvailable = false;
                }
            } else {
                this.homeOrWorkAddressAvailable = false;
                this.tripForm.get('starting_location').reset();
                this.tripForm.get('destination_location').reset();
                this.tripForm.get('home_work').reset();
            }
            this.tripService.getTripsByCustomerName(usr.name).toPromise()
                .then(data => {
                    data.data = data.data.filter(tr => !!tr.driver);
                    if (data.data.length > 0) {
                        this.show_history_table = true;
                        // LogUtil.ConsoleNag(JSON.stringify(usr.history));
                        this.tripHistoryDataSource = new MatTableDataSource(
                            data.data
                        );
                    } else {
                        this.show_history_table = false;
                        this.tripHistoryDataSource = new MatTableDataSource([]);
                    }
                })
                .catch(err => {
                    LogUtil.ConsoleNag(JSON.stringify(err));
                });
            this.cdr.detectChanges();
        } else if (level === Level.DRIVER) {
            this.originalTrip.driver = usr;
            this.tripForm.get('driver.name').setErrors(null);
            this.tripForm.get('driver.phone').setErrors(null);
            this.tripForm.get('driver.name').setValue(usr.name);
            this.tripForm.get('driver.phone').setValue(usr.phone);
        }
    }

    private handleCorporateSearchResponse(response: ServerResponse) {
        if (response.success) {
            const corpGroups = {};
            let first_letter;
            for (const corporate of response.data as CorporateClient[]) {
                first_letter = corporate.name.charAt(0);
                if (corpGroups[first_letter] === undefined) {
                    corpGroups[first_letter] = [];
                }
                corpGroups[first_letter].push(corporate);
            }
            const corporateGroups = [];
            for (const letter of Object.keys(corpGroups)) {
                corporateGroups.push({
                    letter: letter,
                    corporates: corpGroups[letter]
                });
            }
            this.corporateGroups = corporateGroups;

            this.corporateGroupOptions = this.tripForm
                .get('customer.attached_corporate')
                .valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterGroup(value))
                );
        }
    }

    /**
     * A hero's name can't match the given regular expression
     */
    forbiddenNameValidator(level: Level): ValidatorFn {
        if (level === Level.DRIVER) {
            return (control: AbstractControl): { [key: string]: any } | null => {
                const forbidden = ((control.get('name').value !== this.originalTrip.driver.name) &&
                    (control.get('phone').value !== this.originalTrip.driver.phone));
                console.log('forbidden: ' + forbidden);
                return forbidden ? {'forbiddenUser': {value: control.get('name').value + control.get('phone').value}} : null;
            };
        }
    }

    createForm() {
        // @ts-ignore
        // @ts-ignore
        this.tripForm = this.fb.group({
            customer: this.fb.group({
                phone: [
                    '',
                    Validators.compose([
                        Validators.required,
                        Validators.minLength(10),
                        Validators.maxLength(10)
                    ])
                ],
                name: ['', Validators.required],
                attached_corporate: this.selectedCorporate ? this.selectedCorporate.name : '',
                card_number: [
                    '',
                    Validators.compose([
                        this.showCreditCustomerField ? Validators.required : null,
                        Validators.minLength(16),
                        Validators.maxLength(16)
                    ])
                ]
            }),
            starting_location: this.fb.group({
                name: ['', Validators.required]
            }),
            destination_location: this.fb.group({
                name: ['', Validators.required]
            }),
            driver: this.fb.group({
                name: [
                    this.originalTrip.driver
                        ? this.originalTrip.driver.name
                        : '',
                    this.isDriverRequired
                        ? Validators.required
                        : null
                ],
                phone: ([
                    '',
                    Validators.compose([
                        Validators.minLength(10),
                        Validators.maxLength(10),
                        this.isDriverRequired
                            ? Validators.required
                            : null,
                    ])
                ])
            }),
            price: ['', this.originalTrip.trip_status === TripStatus.STARTED ? Validators.required : null],
            km: ['', this.originalTrip.trip_status === TripStatus.STARTED ? Validators.required : null],
            scheduled_date: [this.originalTrip.scheduled_date || moment(), this.showSchedulingFields ? Validators.required : null],
            home_work: new FormControl(''),
            home_work_dest: new FormControl(''),
            credit: new FormControl(!!this.originalTrip.credit),
            customer_rating: new FormControl(''),
            driver_rating: new FormControl('')
        });
        if (!!this.originalTrip) {
            if (this.originalTrip.driver === null) {
                delete this.originalTrip.driver;
            }
            this.tripForm.patchValue(this.originalTrip);
        } else {
            this.dialogRef.close();
        }
        this.tripForm.get('customer.phone').valueChanges.subscribe(value => {
            this.show_history_table = false;
            this._filterPhone(value, Level.CUSTOMER);
        });
        this.tripForm.get('customer.name').valueChanges.subscribe(val => {
            this.show_history_table = false;
            this._filterName(val, Level.CUSTOMER);
        });

        // this.tripForm.get('starting_location.name').valueChanges.subscribe(val => {
        //     if (
        //         this.originalTrip.customer &&
        //         this.originalTrip.customer.address
        //     ) {
        //         if (val !== this.originalTrip.customer.address.home) {
        //             this.tripForm.get('home_work').reset();
        //         } else {
        //             if (this.originalTrip.customer.address.work) {
        //                 if (val !== this.originalTrip.customer.address.work) {
        //                     this.tripForm.get('home_work').reset();
        //                 }
        //             }
        //         }
        //     }
        //     this._filterLocation(val);
        // });
        // this.tripForm.get('destination_location.name').valueChanges.subscribe(val => {
        //     if (
        //         this.originalTrip.customer &&
        //         this.originalTrip.customer.address
        //     ) {
        //         if (val !== this.originalTrip.customer.address.home) {
        //             this.tripForm.get('home_work').reset();
        //         } else {
        //             if (this.originalTrip.customer.address.work) {
        //                 if (val !== this.originalTrip.customer.address.work) {
        //                     this.tripForm.get('home_work').reset();
        //                 }
        //             }
        //         }
        //     }
        //     this._filterLocation(val);
        // });
        this.tripForm
            .get('destination_location.name')
            .valueChanges.subscribe(value => this._filterLocation(value));
        this.tripForm
            .get('starting_location.name')
            .valueChanges.subscribe(value => this._filterLocation(value));

        this.tripForm.get('driver.name').valueChanges.subscribe(value => {
            this._filterName(value, Level.DRIVER);
        });
        this.tripForm.get('driver.phone').valueChanges.subscribe(value => {
            this._filterPhone(value, Level.DRIVER);
        });
        this.tripForm.get('price').valueChanges.subscribe(value => {
            this.calculateKM(value);
        });
        this.tripForm.get('km').valueChanges.subscribe(value => {
            this.calculatePrice(value);
        });
        this.tripForm.get('customer.attached_corporate').setValue(
            this.selectedCorporate ? this.selectedCorporate.name : ''
        );
    }

    calculateKM(price: string) {
        const _price = Number.parseInt(price);
        let KM = 0;
        if (this.late) {
            if (this.corporateToggled && this.selectedCorporate) {
                KM = (_price - this.selectedCorporate.base_price -
                    (this.waitingTime * this.selectedCorporate.waiting_deal)) /
                    this.selectedCorporate.night_deal;
            } else {
                KM = (_price - this.NIGHT_BASE_PRICE -
                    (this.waitingTime * this.WAITING_RATE)) /
                    this.NIGHT_RATE;
            }
        } else {
            if (this.corporateToggled && this.selectedCorporate) {
                KM = (_price - this.selectedCorporate.base_price -
                    (this.waitingTime * this.selectedCorporate.waiting_deal)) /
                    this.selectedCorporate.day_deal;
            } else {
                KM = (_price - this.DAY_BASE_PRICE -
                    (this.waitingTime * this.WAITING_RATE)) /
                    this.DAY_RATE;
            }
        }
        if (KM < 0 || isNaN(KM)) {
            KM = 0;
        }
        this.tripForm.get('km').setValue(KM.toPrecision(4), {emitEvent: false});
        this.originalTrip.km = KM.toPrecision(4);
    }

    calculatePrice(km: string) {
        const _km = Number.parseInt(km);
        let price = 0;
        if (this.late) {
            if (this.corporateToggled && this.selectedCorporate) {
                price = this.selectedCorporate.base_price +
                    (_km * this.selectedCorporate.night_deal) +
                    (this.waitingTime * this.selectedCorporate.waiting_deal);
            } else {
                price = this.NIGHT_BASE_PRICE +
                    (_km * this.NIGHT_RATE) +
                    (this.waitingTime * this.WAITING_RATE);
            }
        } else {
            if (this.corporateToggled && this.selectedCorporate) {
                price = this.selectedCorporate.base_price +
                    (_km * this.selectedCorporate.day_deal) +
                    (this.waitingTime * this.selectedCorporate.waiting_deal);
            } else {
                price = this.DAY_BASE_PRICE +
                    (_km * this.DAY_RATE) +
                    (this.waitingTime * this.WAITING_RATE);
            }
        }
        if (price < 0 || isNaN(price)) {
            price = 0;
        }
        this.tripForm.get('price').setValue(price.toPrecision(4), {emitEvent: false});
        this.originalTrip.price = price.toPrecision(4);
    }

    showEnterMessage(control_name: string) {
        return !this.tripForm.get(control_name).value && this.tripForm.touched;
    }

    showNotValidMessage(control_name: string) {
        return (
            this.tripForm.get(control_name).value &&
            !this.tripForm.get(control_name).valid &&
            this.tripForm.dirty
        );
    }

    disableIgnoreOrDelete() {
        const testCondition = this.originalTrip.customer ? this.originalTrip.customer.name !== 'test' :
            true;
        return testCondition && (this.originalTrip.trip_status === TripStatus.COMPLETED);
    }

    disableSave() {
        const condition = this.originalTrip.trip_status === TripStatus.PENDING ?
            (!this.tripForm.get('customer').valid ||
                !this.tripForm.get('starting_location').valid ||
                !this.tripForm.get('destination_location').valid) :
            !this.tripForm.valid;
        return condition;
    }

    disableSubmit() {
        return (
            !this.tripForm.valid ||
            this.originalTrip.trip_status === TripStatus.PRE_PENDING ||
            this.originalTrip.trip_status === TripStatus.COMPLETED
        );
    }

    onSubmit() {
        this.submitTrip(true, false);
    }

    ignoreOrDelete() {
        if (this.originalTrip.trip_status === TripStatus.PRE_PENDING) {
            const resp: TripFormResult = {
                isIgnored: true,
                formTrip: null
            };
            this.submitted = true;
            LogUtil.ConsoleNag(JSON.stringify(resp));
            this.dialogRef.close(resp);
        } else {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;
            dialogConfig.hasBackdrop = false;
            dialogConfig.width = '350px';
            dialogConfig.position = {
                bottom: '200px',
                left: '550px'
            };
            const secondDialogRef = this.dialog.open(
                CancelTripComponent,
                dialogConfig
            );
            secondDialogRef.afterClosed().subscribe((result: string) => {
                this.tripCancelCallBack(result);
            });
        }
    }

    tripCancelCallBack(result: string): void {
        if (result) {
            this.cancellationCode = result;
            this.submitTrip(false, true);
        }
    }

    get creditCustomer(): boolean {
        // console.log('current state' + this.showCreditCustomerField);
        return this.showCreditCustomerField;
    }

    setCreditCustomer(previousState: boolean) {
        this.showCreditCustomerField = !previousState;
    }

    setWaitingTime() {
        if (!!this.originalTrip.start) {
            const startedTime = Date.parse(this.originalTrip.start.toString());
            const arrivalTime = Date.parse(this.originalTrip.arrival_time.toString());
            const diff = (startedTime - arrivalTime) / 60000;
            LogUtil.ConsoleNag(`calculated waiting_time time: ${diff}`);
            this.waitingTime = Number(diff.toFixed(2));
        }
    }

    get submitLabel(): string {
        return this.originalTrip.trip_status === TripStatus.STARTED
            ? 'Complete'
            : 'Next';
    }

    get ignoreOrDeleteLabel(): string {
        return this.originalTrip.trip_status === TripStatus.PRE_PENDING
            ? 'Ignore'
            : 'Delete';
    }

    get showPaymentFields(): boolean {
        return this.originalTrip.trip_status === TripStatus.STARTED ||
            this.originalTrip.trip_status === TripStatus.COMPLETED;
    }

    get showDriverFields(): boolean {
        return this.originalTrip.trip_status !== TripStatus.PRE_PENDING;
    }

    get tripStatusLabel(): string {
        switch (this.originalTrip.trip_status) {
            case TripStatus.PRE_PENDING:
                return 'prepending';
            case TripStatus.PENDING:
                return 'pending';
            case TripStatus.ACCEPTED:
                return 'accepted';
            case TripStatus.STARTED:
                return 'started';
            case TripStatus.ARRIVED:
                return 'arrived';
            case TripStatus.COMPLETED:
                return 'completed';
            default:
                LogUtil.ConsoleNag('INVALID FORMER TRIP STATUS');
                return;
        }
    }

    hideTripModal() {
        const shouldUpgrade =
            this.originalTrip.trip_status === TripStatus.PRE_PENDING;
        this.submitTrip(shouldUpgrade, false);
    }

    setDispatcher(updatedTrip: Trip) {
        switch (updatedTrip.trip_status) {
            case TripStatus.PENDING:
                updatedTrip.received_by = this.authService.getAuthUser();
                break;
            case TripStatus.ACCEPTED:
                updatedTrip.received_by = this.originalTrip.received_by || null;
                updatedTrip.accepted_by = this.authService.getAuthUser();
                break;
            case TripStatus.STARTED:
                updatedTrip.received_by = this.originalTrip.received_by || null;
                updatedTrip.accepted_by = this.originalTrip.accepted_by || null;
                updatedTrip.started_by = this.authService.getAuthUser();
                break;
            case TripStatus.COMPLETED:
                updatedTrip.received_by = this.originalTrip.received_by || null;
                updatedTrip.accepted_by = this.originalTrip.accepted_by || null;
                updatedTrip.started_by = this.originalTrip.started_by || null;
                updatedTrip.completed_by = this.authService.getAuthUser();
                break;
            case TripStatus.CANCELLED:
                updatedTrip.received_by = this.originalTrip.received_by || null;
                updatedTrip.accepted_by = this.originalTrip.accepted_by || null;
                updatedTrip.started_by = this.originalTrip.started_by || null;
                updatedTrip.cancelled_by = this.authService.getAuthUser();
                break;
            default:
                break;
        }
    }

    submitTrip(shouldUpgradeTripStatus: boolean, isBeingCancelled: boolean) {
        const formerStatus = this.originalTrip.trip_status;
        const updatedTrip: Trip = Object.assign({}, this.tripForm.value);
        updatedTrip._id = this.originalTrip._id;
        this.submitted = true;
        const formResult: TripFormResult = {
            formTrip: updatedTrip,
            isIgnored: false
        };
        if (isBeingCancelled) {
            updatedTrip.cancellation_code = getCancellationCode(
                this.cancellationCode
            );
            updatedTrip.trip_status = TripStatus.CANCELLED;
            this.dialogRef.close(formResult);
            return;
        }
        if (shouldUpgradeTripStatus) {
            switch (formerStatus) {
                case TripStatus.PRE_PENDING:
                    updatedTrip.trip_status = TripStatus.PENDING;
                    break;
                case TripStatus.PENDING:
                    updatedTrip.trip_status = TripStatus.ACCEPTED;
                    break;
                case TripStatus.ACCEPTED:
                    updatedTrip.trip_status = TripStatus.ARRIVED;
                    break;
                case TripStatus.ARRIVED:
                    updatedTrip.trip_status = TripStatus.STARTED;
                    break;
                case TripStatus.STARTED:
                    updatedTrip.trip_status = TripStatus.COMPLETED;
                    break;
                case TripStatus.COMPLETED:
                    updatedTrip.trip_status = TripStatus.COMPLETED;
                    break;
                default:
                    LogUtil.ConsoleNag('INVALID FORMER TRIP STATUS');
                    return;
            }
            this.setDispatcher(updatedTrip);
        } else {
            updatedTrip.trip_status = formerStatus;
        }
        updatedTrip.isSaved = this.originalTrip.isSaved;
        updatedTrip.notified = this.originalTrip.notified;
        if (updatedTrip.customer && this.originalTrip.customer) {
            updatedTrip.customer._id = this.originalTrip.customer._id;
        }
        if (updatedTrip.driver && this.originalTrip.driver) {
            updatedTrip.driver._id = this.originalTrip.driver._id;
        }
        if (this.showSchedulingFields) {
            updatedTrip.is_scheduled = true;
            const time = moment(this.scheduled_time, 'hh:mm A').toDate();
            const scheduled: Date = new Date(updatedTrip.scheduled_date.toString());
            scheduled.setHours(time.getHours());
            scheduled.setMinutes(time.getMinutes());
            scheduled.setSeconds(time.getSeconds());
            const scheduleMilliSeconds = Date.parse(scheduled.toString());
            if (scheduleMilliSeconds > Date.now()) {
                updatedTrip.notified = false;
            }
            updatedTrip.scheduled_date = scheduled;
        } else {
            updatedTrip.is_scheduled = false;
        }

        if (updatedTrip.customer && this.originalTrip.customer) {
            if (
                updatedTrip.customer.name === this.originalTrip.customer.name &&
                updatedTrip.customer.phone === this.originalTrip.customer.phone
            ) {
                if (!this.originalTrip.customer.card_number && updatedTrip.customer.card_number) {
                    this.originalTrip.customer.card_number = updatedTrip.customer.card_number;
                }
                if (this.corporateToggled) {
                    this.originalTrip.customer.attached_corporate = this.selectedCorporate;
                }
                updatedTrip.is_corporate = this.corporateToggled;
                updatedTrip.customer = this.originalTrip.customer;
            }
        }
        if ((formerStatus === TripStatus.PENDING) && this.originalTrip.driver) {
            if (
                updatedTrip.driver.name === this.originalTrip.driver.name &&
                updatedTrip.driver.phone === this.originalTrip.driver.phone
            ) {
                updatedTrip.driver = this.originalTrip.driver;
            }
        }
        if (updatedTrip.starting_location && this.originalTrip.starting_location) {
            if (updatedTrip.starting_location.name === this.originalTrip.starting_location.name) {
                updatedTrip.starting_location = this.originalTrip.starting_location;
            }
        }
        if (updatedTrip.destination_location && this.originalTrip.destination_location) {
            if (updatedTrip.destination_location.name === this.originalTrip.destination_location.name) {
                updatedTrip.destination_location = this.originalTrip.destination_location;
            }
        }
        if (updatedTrip.km === 'NaN') {
            updatedTrip.km = '';
        }
        updatedTrip.call_time = this.originalTrip.call_time || null;
        updatedTrip.confirmation = this.originalTrip.confirmation || null;
        updatedTrip.arrival_time = this.originalTrip.arrival_time || null;
        updatedTrip.start = this.originalTrip.start || null;
        updatedTrip.time_added = this.originalTrip.time_added || null;
        updatedTrip.credit = this.showCreditCustomerField;
        if (this.isSupervisorManaging) {
            this.addCustomTimeStamp(updatedTrip);
            this.dialogRef.close(formResult);
        } else {
            if (!this.isTimeStamped(updatedTrip)) {
                this.addTimeStamp(updatedTrip).then(success => {
                    if (success) {
                        this.dialogRef.close(formResult);
                    }
                });
            } else {
                this.dialogRef.close(formResult);
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    isTimeStamped(trip: Trip): boolean {
        switch (trip.trip_status) {
            case TripStatus.PENDING:
                return !!trip.call_time;
            case TripStatus.ACCEPTED:
                return !!trip.confirmation;
            case TripStatus.ARRIVED:
                return !!trip.arrival_time;
            case TripStatus.STARTED:
                return !!trip.start;
            case TripStatus.COMPLETED:
                return !!trip.time_added;
            case TripStatus.CANCELLED:
                return !!trip.time_cancelled;
            default:
                LogUtil.ConsoleNag('Invalid trip status inside isTimeStamped');
                return true;
        }
    }

    addTimeStamp(trip: Trip): Promise<boolean> {
        return this.httpService
            .getTimeStamp()
            .then(response => {
                const timeStamp = response.data;
                switch (trip.trip_status) {
                    case TripStatus.PENDING:
                        trip.call_time = timeStamp;
                        break;
                    case TripStatus.ACCEPTED:
                        trip.confirmation = timeStamp;
                        break;
                    case TripStatus.ARRIVED:
                        trip.arrival_time = timeStamp;
                        break;
                    case TripStatus.STARTED:
                        trip.start = timeStamp;
                        break;
                    case TripStatus.COMPLETED:
                        trip.time_added = timeStamp;
                        break;
                    case TripStatus.CANCELLED:
                        trip.time_cancelled = timeStamp;
                        break;
                    default:
                        LogUtil.AlertNag(
                            'Invalid trip status inside addTimeStamp'
                        );
                        return;
                }
                return true;
            })
            .catch((error: HttpErrorResponse) => {
                LogUtil.ConsoleNag(JSON.stringify(error));
                LogUtil.ConsoleNag('Could not fetch timestamp', true);
                handleError(error);
                return false;
            });
    }

    toggleCreditCustomer() {
        this.originalTrip.credit = this.showCreditCustomerField;
        this.tripForm.get('credit').setValue(this.originalTrip.credit, {emitEvent: false});
        this.tripForm.get('credit').updateValueAndValidity();
        if (this.originalTrip.credit) {
            if (this.originalTrip.customer.card_number) {
                this.tripForm.get('customer.card_number').setValue(this.originalTrip.customer.card_number, {emitEvent: false});
                this.tripForm.get('customer.card_number').updateValueAndValidity();
            } else {
                this.originalTrip.customer.card_number = this.tripForm.get('customer.card_number').value;
                this.tripForm.get('customer.card_number').updateValueAndValidity();
            }
        }

    }

    handleHistorySelected(trip: Trip) {
        this.originalTrip.starting_location = trip.starting_location;
        this.originalTrip.destination_location = trip.destination_location;
        this.tripForm
            .get('starting_location.name')
            .setValue(trip.starting_location.name);
        this.tripForm
            .get('destination_location.name')
            .setValue(trip.destination_location.name);
        this.show_history_table = false;
    }

    hideHistorySuggestion() {
        this.show_history_table = false;
    }

    addCustomTimeStamp(trip: Trip) {
        LogUtil.ConsoleNag(`stamp date: ${this.timeStampDate} stamp time: ${this.timeStampTime}`);
        const time = moment(this.timeStampTime, 'hh:mm A').toDate();
        const date = new Date(this.timeStampDate.toString());
        LogUtil.ConsoleNag(`momented date: ${date} momented time: ${time}`);
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        date.setSeconds(time.getSeconds());
        switch (trip.trip_status) {
            case TripStatus.PENDING:
                trip.call_time = date;
                break;
            case TripStatus.ACCEPTED:
                trip.confirmation = date;
                break;
            case TripStatus.ARRIVED:
                trip.arrival_time = date;
                break;
            case TripStatus.STARTED:
                trip.start = date;
                break;
            case TripStatus.COMPLETED:
                trip.time_added = date;
                break;
            default:
                LogUtil.AlertNag(
                    'Invalid trip status inside addCustomTimeStamp'
                );
        }
    }

    setCustomTimeStampDefaults() {
        let date: Date;
        switch (this.originalTrip.trip_status) {
            case TripStatus.PRE_PENDING:
                date = null;
                break;
            case TripStatus.PENDING:
                date = this.originalTrip.call_time;
                break;
            case TripStatus.ACCEPTED:
                date = this.originalTrip.confirmation;
                break;
            case TripStatus.ARRIVED:
                date = this.originalTrip.arrival_time;
                break;
            case TripStatus.STARTED:
                date = this.originalTrip.start;
                break;
            case TripStatus.COMPLETED:
                date = this.originalTrip.time_added;
                break;
            default:
                LogUtil.AlertNag(
                    'Invalid trip status inside addCustomTimeStamp'
                );
        }
        this.timeStampTime = date ? moment(date).format('hh:mm A') : moment(new Date()).format('hh:mm A');
        this.timeStampDate = date ? moment(date) : moment();
    }

    get isSupervisorManaging() {
        return this.authService.getManagingUserLevel() === Level.SUPERVISOR;
    }

    get timeStampLabel(): string {
        switch (this.originalTrip.trip_status) {
            case TripStatus.PRE_PENDING:
                return 'Call';
            case TripStatus.PENDING:
                return 'Accepted';
            case TripStatus.ACCEPTED:
                return 'Started';
            case TripStatus.STARTED:
                return 'Arrival';
            default:
                LogUtil.ConsoleNag('Invalid trip status inside timeStampLabel');
                return '';
        }

    }

    public get isDriverRequired(): boolean {
        // @ts-ignore
        return this.originalTrip.trip_status !== TripStatus.PRE_PENDING &&
            this.originalTrip.trip_status !== TripStatus.PENDING;
    }

    showDisputeForm() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = false;
        dialogConfig.width = '80vw';
        dialogConfig.data = this.originalTrip;
        const secondDialogRef = this.dialog.open(DisputeComponent, dialogConfig).afterClosed().toPromise()
            .then(() => this.dialogRef.close());
    }
}
