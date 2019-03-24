import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { TripService } from '../../shared/services';
import { UserService } from '../../shared/services';
import { Level } from '../../shared/configs/levels.config';
import { Trip } from '../../shared/models';
import {
    MatPaginator,
    MatDialog,
    MatDialogConfig,
    MatDialogRef,
    MatTableDataSource,
    MatSort
} from '@angular/material';
import { User } from '../../shared/models';
import { Router } from '@angular/router';
import { RouteConfig } from '../../shared/configs';
import { TripDetailsComponent } from '../trip/trip-details/trip-details.component';
import { saveAs } from 'file-saver';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';


@Component({
    selector: 'app-finance',
    templateUrl: './finance.component.html',
    styleUrls: ['./finance.component.scss']
})
export class FinanceComponent implements OnInit {
    columnsToDisplay = [
        'name',
        'phone',
        'history',
        'card_number',
        'account_status'
    ];
    //  km, waiting time, 'payment type', price, commission, company name, card number, call time,
    //  confirmation time, arrival time, trip starting time, trip end time, cancellation, dispatcher name,
    //   date, collection status, collected date];

    constructor(
        private router: Router,
        private tripService: TripService,
        private userService: UserService,
        private dialog: MatDialog
    ) { }

    private trips: Trip[];
    driverDataSource: MatTableDataSource<User>;

    @ViewChild(MatSort) sort: MatSort;

    ngOnInit() {
        this.userService
            .getAllUsers(Level.DRIVER)
            .toPromise()
            .then(data => {
                this.driverDataSource = new MatTableDataSource(data.data);
                this.driverDataSource.sort = this.sort;
            });
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // DataSource defaults to lowercase matches
        this.driverDataSource.filter = filterValue;
        if (this.driverDataSource.paginator) {
            this.driverDataSource.paginator.firstPage();
        }
    }

    calculateUncollected(trips: Trip[]) {
    let uncollected = 0;
    for (const trip of trips) {
        if (!trip.collected) {
            uncollected ++;
        }
    }
    return uncollected;
    }

  onExportClick() {
    this.tripService.exportTrips().toPromise()
      .then(data => {
        saveAs(data, 'trips.xlsx');
      })
      .catch(err => console.error(err));
  }
}
