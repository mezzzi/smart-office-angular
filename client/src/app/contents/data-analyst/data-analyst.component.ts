import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatPaginator, MatTableDataSource} from '@angular/material';
import {Trip} from '../../shared/models';
import {TripService, UserService} from '../../shared/services';
import {LogUtil} from '../../shared/utils';
import {SelectionModel} from '@angular/cdk/collections';
import {TripDetailsComponent} from '../trip/trip-details/trip-details.component';
import {TripStatus} from '../../shared/configs';
import {ServerResponse} from '../../shared/interfaces';
import {HttpErrorResponse} from '@angular/common/http';
import {startWith, map} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CorporateClient} from '../../shared/models/corporate.client.model';
import {CorporateClientService} from '../../shared/services/corporate.client.service';


export interface CorporateGroup {
    letter: string;
    corporates: CorporateClient[];
}

const _filter = (opt: CorporateClient[], value: string): CorporateClient[] => {
    const filterValue = value.toLowerCase();
    return opt.filter(item => item.name.toLowerCase().indexOf(filterValue) === 0);
};

@Component({
    selector: 'app-data-analyst',
    templateUrl: './data-analyst.component.html',
    styleUrls: ['./data-analyst.component.scss']
})

export class DataAnalystComponent implements OnInit {

    private trips: Trip[] = [];
    dataSource: MatTableDataSource<Trip>;
    selection = new SelectionModel<Trip>(true, []);

    corporateGroupOptions: Observable<CorporateGroup[]>;
    corporateGroups: CorporateGroup[];

    userForm: FormGroup;


    loaded = false;
    displayedColumns = ['client_name', 'corporate_name', 'card_number', 'driver_name', 'price', 'date'];
    columnNames = [
        {
            value: 'corporate_name',
            name: 'Corporate Name'
        },
        {
            value: 'client_name',
            name: 'Client Name'
        },
        {
            value: 'client_phone',
            name: 'Client Phone'
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
            value: 'card_number',
            name: 'Account Number'
        },
        {
            value: 'price',
            name: 'Trip Price'
        },
        {
            value: 'date',
            name: 'Date'
        },
        {
            value: 'km',
            name: 'KM'
        },
        {
            value: 'waiting_time',
            name: 'Waiting Time'
        }

    ];
    private selectedCorporate: CorporateClient;

    constructor(private tripService: TripService,
                private dialog: MatDialog,
                private route: ActivatedRoute,
                protected userService: UserService,
                protected fb: FormBuilder,
                private corporateClientService: CorporateClientService
    ) {
        this.createForm();
        this.getCorporates();

    }

    @ViewChild(MatPaginator) paginator: MatPaginator;
    private totalCredit = 0.00;

    ngOnInit() {

    }

    createForm() {
        this.userForm = this.fb.group({
            attached_corporate: this.selectedCorporate ? this.selectedCorporate.name : '',

        });
        this.userForm.get('attached_corporate').setValue(
            this.selectedCorporate ? this.selectedCorporate.name : ''
        );
    }

    getCorporates() {
        this.corporateClientService
            .getCorporates()
            .then((response: ServerResponse) =>
                this.handleCorporateSearchResponse(response)
            );
    }


    refreshTable(corporateId?: string) {
        this.totalCredit = 0.0;
        if (corporateId) {
            this.tripService.getTrips().toPromise()
                .then(resp => {
                    this.trips = resp.data.filter(tr => !!tr.customer &&
                        tr.customer.attached_corporate && tr.customer.attached_corporate._id === corporateId);
                    reload();
                })
                .catch(err => console.error(err));
        } else {
            this.tripService.getTrips().toPromise()
                .then(resp => {
                    this.trips = resp.data.filter(tr => !!tr.customer &&
                        !!tr.customer.attached_corporate && tr.trip_status !== TripStatus.CANCELLED);
                    reload();
                })
                .catch(err => console.error(err));
        }
        const reload = () => {
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
        };
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // DataSource defaults to lowercase matches
        this.dataSource.filter = filterValue;
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

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

    onCorporateChange(corporate: CorporateClient) {
        this.selectedCorporate = corporate;
        this.userForm.get('attached_corporate').setValue(corporate.name);
        this.refreshTable(corporate._id);
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

            this.corporateGroupOptions = this.userForm
                .get('attached_corporate')
                .valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterGroup(value))
                );

            this.refreshTable();
        }
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
        if (trip.customer.attached_corporate) {
            switch (this.displayedColumns[index]) {
                case 'client_name':
                    return trip.customer ? trip.customer.name : '';
                case 'corporate_name':
                    return trip.customer && trip.customer.attached_corporate ? trip.customer.attached_corporate.name : '';
                case 'client_phone':
                    return trip.customer ? trip.customer.phone : '';
                case 'starting_location':
                    return trip.starting_location.name;
                case 'destination_location':
                    return trip.destination_location.name;
                case 'driver_name':
                    return trip.driver ? trip.driver.name : '';
                case 'card_number':
                    return trip.customer ? trip.customer.card_number : '';
                case 'date':
                    return trip.time_added;
                case 'price':
                    return trip.price;
                case 'km':
                    return trip.km;
                case 'waiting_time':
                    return trip.waiting_time;
                default:
                    return 'Unknown';

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

    updateTotal() {
        const selectedRows = this.selection.selected;
        const collectIds: string[] = [];
        this.totalCredit = 0;
        for (const row of selectedRows) {
            if (row.trip_status !== TripStatus.ARRIVED || row.collected) {
                continue;
            }
            if (row.credit) {
                this.totalCredit += parseFloat(row.price);
            } else {
                this.totalCredit -= parseFloat(row.price);
            }
        }
    }

    getPlaceHolder(index: number): string {
        const name = this.displayedColumns[index];
        const target = this.columnNames.filter(name_val => name_val.value === name)[0];
        return !!target ? target.name : '';
    }

    getFooterLabel(index: number) {
        if (index === 1) {
            return this.totalCredit === 0 ? 'Balance : ' : (this.totalCredit > 0 ? 'To Be Paid :' : 'To Be Collected : ');
        } else if (index === 2) {
            return `${Math.abs(this.totalCredit)} Birr`;
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
            this.refreshTable();
        });
    }
}
