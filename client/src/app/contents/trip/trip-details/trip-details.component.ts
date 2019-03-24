import { Component, OnInit, ElementRef, Input, ViewChild, Inject } from '@angular/core';
import { MainService, TripService } from '../../../shared/services/index';
import { Router } from '@angular/router';
import { LogUtil } from '../../../shared/utils/index';
import { Route, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatTableDataSource, MatSort, MatPaginator, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Trip } from '../../../shared/models/index';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';
import { TripStatus } from '../../../shared/configs/index';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.scss']
})
export class TripDetailsComponent implements OnInit {

  panelOpenState = false;
  loaded = false;
  private gotUrl = false;
  private trip: Trip;
  dataSource__customer = new MatTableDataSource([]);
  dataSource__driver = new MatTableDataSource([]);
  dataSource__transactions = new MatTableDataSource([]);
  displayedColumns = ['driver_name', 'customer_name', 'trip_status', 'starting_location', 'destination_location', 'call_time'];
  COLORS = { 'arrived': 'teal', 'cancelled': 'red', 'started': 'blue', 'pending': 'gray' };
  transactionDisplayedColumns = ['km', 'price', 'waiting_time', 'etta_fee', 'started_time', 'arrived_time'];
  _trip: Trip;
  submitting = false;
  ___trip: Trip;
  waiting_time;
  constructor(private ref: ElementRef,
    private tripService: TripService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public __trip,
    private snackBar: MatSnackBar) {
    // populate template with injected trip object
    this.trip = __trip;
    this.___trip = this.trip;
    this.___trip.waiting_time = this.__trip.waiting_time ? this.__trip.waiting_time : 0;
    this._trip = this.trip;
    this.tripService.getTripsByCustomerName(__trip.customer.name).toPromise()
      .then(data => {
        this.dataSource__customer.data = data.data;
        return this.tripService.getTripsByDriverName(this.trip.driver.name).toPromise();
      }).then(data => {
        this.dataSource__driver.data = data.data;
        this._trip.price = this.trip.price;
        if (this.trip.trip_status === TripStatus.ARRIVED) {
          this.dataSource__transactions.data = [this.trip];
        }
        this.loaded = true;
      });
  }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(SidebarComponent) sidebarComponent: SidebarComponent;
  ngOnInit() {
    this.trip = this.__trip;
    if (this.sidebarComponent) {
      this.sidebarComponent.hideSidebar();
    }
    this.dataSource__customer.sort = this.sort;
    this.dataSource__customer.paginator = this.paginator;
    this.dataSource__driver.sort = this.sort;
    this.dataSource__driver.paginator = this.paginator;
  }
  applyFilter(filterValue: string) {
    this.dataSource__customer.filterPredicate = (data, filter) => {
      filter = filter.toLowerCase();
      return data.customer.name.toLowerCase().indexOf(filter) !== -1 ||
        data.driver.name.toLowerCase().indexOf(filter) !== -1 ||
        data.trip_status.toLowerCase().indexOf(filter) !== -1 ||
        data.starting_location.name.toLowerCase().indexOf(filter) !== -1 ||
        data.destination_location.name.toLowerCase().indexOf(filter) !== -1;
    };
    this.dataSource__driver.filterPredicate = (data, filter) => {
      filter = filter.toLowerCase();
      return data.customer.name.toLowerCase().indexOf(filter) !== -1 ||
        data.driver.name.toLowerCase().indexOf(filter) !== -1 ||
        data.trip_status.toLowerCase().indexOf(filter) !== -1 ||
        data.starting_location.name.toLowerCase().indexOf(filter) !== -1 ||
        data.destination_location.name.toLowerCase().indexOf(filter) !== -1;
    };
    this.dataSource__customer.filter = filterValue.trim().toLowerCase();
    this.dataSource__driver.filter = filterValue.trim().toLowerCase();
    if (this.dataSource__customer.paginator) {
      this.dataSource__customer.paginator.firstPage();
    }
    if (this.dataSource__driver.paginator) {
      this.dataSource__driver.paginator.firstPage();
    }
  }

  getTotalCost() {
    return parseFloat(this.trip.price) + parseFloat(this.trip.et_fee) + parseFloat(this.trip.waiting_time);
  }

  getEttaFee() {
    return 0.1 * (parseFloat(this.trip.price) + parseFloat(this.trip.waiting_time));
  }

  onClickCollected() {
    this.submitting = true;
    // if (this.___trip.waiting_time === this.waiting_time || !this.___trip.waiting_time) {
    //   console.log(this._trip.waiting_time, this.waiting_time);
    //   console.log('deleting waiting time');
    //   delete this.___trip.waiting_time;
    // }

    this.tripService.updateTrip(this.trip._id, {
      ...this.___trip
    }).then(data => {
      this.submitting = false;
      this.loaded = false;
      this.trip = data.data;
      this.___trip = data.data;
      this._trip = data.data;
      this.waiting_time = data.data.waiting_time;
      this.trip.et_fee = data.data.et_fee;
      this.trip.waiting_time = data.data.waiting_time;
      this.loaded = true;
      this.snackBar.open('Successfully Updated Trip', 'OK', {
        duration: 2000
      });
      // this.router.navigate(['/trip'], {
      //   queryParams: {
      //     success: true
      //   }
      // });
    })
      .catch(err => {
        this.snackBar.open('Something went wrong!', 'OK', {
          duration: 2000
        });
      });
  }

}
