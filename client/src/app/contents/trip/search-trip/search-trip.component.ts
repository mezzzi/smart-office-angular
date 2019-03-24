import {Component, OnInit, ViewChild} from '@angular/core';
import {TripService} from '../../../shared/services';
import {Trip} from '../../../shared/models';
import {MatSort, MatTableDataSource, MatPaginator, MatDialogRef} from '@angular/material';
import {SidebarComponent} from '../../../layout/sidebar/sidebar.component';
import {TripComponent} from '../trip.component';
import {TripStatus} from '../../../shared/configs';
import {LogUtil} from '../../../shared/utils';

@Component({
    selector: 'app-search-trip',
    templateUrl: './search-trip.component.html',
    styleUrls: ['./search-trip.component.scss']
})
export class SearchTripComponent implements OnInit {

    private trips: Trip[] = [];
    dataSource = new MatTableDataSource(this.trips);
    loaded = false;
    displayedColumns = ['driver_name', 'customer_name', 'trip_status', 'starting_location', 'destination_location', 'call_time'];
    COLORS = {'arrived': 'teal', 'cancelled': 'red', 'started': 'blue', 'pending': 'gray'};

    constructor(private tripService: TripService,
                private dialogRef: MatDialogRef<SearchTripComponent>) {
    }

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        // this.tripService.getTripsByCustomerName('feleqech').toPromise()
        //     .then(data => console.log(data))
        //     .catch(err => console.error(err));
        // this.tripService.getTrips().toPromise()
        //     .then(data => {
        //         data.data = data.data.filter(trip => !!trip.customer);
        //         return data.data;
        //     })
        //     .then(data => {
        //         this.trips = data;
        //         return this.trips;
        //     })
        //     .then(trips => {
        //         this.dataSource.data = trips;
        //         this.loaded = true;
        //     })
        //     .catch(err => console.error(err));
        this.loadLiveTrips();
        this.dataSource.data = this.trips;
        this.loaded = true;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filterPredicate = (data, filter) => {
            filter = filter.toLowerCase();
            if (!data.driver) {
                return data.customer.name.toLowerCase().indexOf(filter) !== -1 ||
                    data.trip_status.toLowerCase().indexOf(filter) !== -1 ||
                    data.starting_location.name.toLowerCase().indexOf(filter) !== -1 ||
                    data.destination_location.name.toLowerCase().indexOf(filter) !== -1;
            } else {
                return data.customer.name.toLowerCase().indexOf(filter) !== -1 ||
                    data.driver.name.toLowerCase().indexOf(filter) !== -1 ||
                    data.trip_status.toLowerCase().indexOf(filter) !== -1 ||
                    data.starting_location.name.toLowerCase().indexOf(filter) !== -1 ||
                    data.destination_location.name.toLowerCase().indexOf(filter) !== -1;
            }
        };
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    loadLiveTrips() {
        this.trips = [];
        this.tripService.pendingTrips.forEach(trip => {
            this.trips.push(trip);
        });
        this.tripService.acceptedTrips.forEach(trip => {
            this.trips.push(trip);
        });
        this.tripService.startedTrips.forEach(trip => {
            this.trips.push(trip);
        });
        this.tripService.arrivedTrips.forEach(trip => {
            this.trips.push(trip);
        });
        this.tripService.completedTrips.forEach(trip => {
            this.trips.push(trip);
        });
    }

    launchEditFilteredTripDialog(trip: Trip) {
        this.dialogRef.close();
        LogUtil.ConsoleNag('TRIP STATUS FIRST: ' + trip.trip_status);
        this.tripService.setFilteredTripToDisplay(trip);
    }

    closeSearchDialog() {
        this.dialogRef.close();
    }
}
