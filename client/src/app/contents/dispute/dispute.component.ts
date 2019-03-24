import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { AuthService, UserService, TripService } from '../../shared/services';
import { DisputeService } from '../../shared/services/dispute.service';
import { User, Trip } from '../../shared/models';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { Level } from '../../shared/configs';

@Component({
  selector: 'app-dispute',
  templateUrl: './dispute.component.html',
  styleUrls: ['./dispute.component.scss']
})
export class DisputeComponent implements OnInit {

  private disputeForm: FormGroup;
  loaded = false;
  loading = false;
  private dispatchers: User[];
  private customers: User[];
  private drivers: User[];
  private driverFilteredOptions: Observable<User[]>;
  private dispatcherFilteredOptions: Observable<User[]>;
  private customerFilteredOptions: Observable<User[]>;
  private selectedDriver: User;
  private selectedCustomer: User;
  private trip_id;

  constructor(private authService: AuthService,
    private disputeService: DisputeService, private userService: UserService,
    private dialogRef: MatDialogRef<DisputeComponent>,
    @Inject(MAT_DIALOG_DATA) trip: Trip,
    private snackBar: MatSnackBar,
    private tripService: TripService
  ) {
    this.selectedCustomer = trip.customer;
    this.selectedDriver = trip.driver ? trip.driver : null;
    this.trip_id = trip._id;
  }

  ngOnInit() {
    this.disputeForm = new FormGroup({
      body: new FormControl('', [Validators.required]),
      customer: new FormControl(null, [Validators.required]),
      dispatcher: new FormControl(null, [Validators.required]),
      submitted_by: new FormControl(this.authService.getAuthUser()),
      driver: new FormControl(null, [Validators.required]),
      fault_by: new FormControl(null, [Validators.required])
    });
    this.disputeForm.get('driver').setValue(this.selectedDriver);
    this.disputeForm.get('customer').setValue(this.selectedCustomer);
    // set currently logged in dispatcher as selected dispatcher
    if (this.authService.getManagingUserLevel() === Level.DISPATCHER) {
      this.disputeForm.get('dispatcher').setValue(this.authService.getAuthUser());
    } else {
      this.disputeForm.get('dispatcher').setValue(this.authService.getAuthUser());
    }
    this.userService.getDispatchers().toPromise()
      .then(data => {
        if (this.authService.getManagingUserLevel() === Level.DISPATCHER) {
          this.dispatchers = [this.authService.getAuthUser()];
        } else {
          this.dispatchers = data.data;
        }
      })
      .then(() => this.userService.getCustomers().toPromise())
      .then(data => this.customers = data.data)
      .then(() => this.userService.getDrivers().toPromise())
      .then(data => this.drivers = data.data)
      .then(() => this.loaded = true);

    this.driverFilteredOptions = this.disputeForm.get('driver').valueChanges
      .pipe(
        startWith<string | User>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this.drivers = this._filter(name, this.drivers) : this.drivers.slice())
      );
    this.customerFilteredOptions = this.disputeForm.get('customer').valueChanges
      .pipe(
        startWith<string | User>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this.customers = this._filter(name, this.customers) : this.customers.slice())
      );
    this.dispatcherFilteredOptions = this.disputeForm.get('dispatcher').valueChanges
      .pipe(
        startWith<string | User>(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => {
          if (this.authService.getManagingUserLevel() === Level.DISPATCHER) {
            return name ? this.dispatchers = [this.authService.getAuthUser()] : this.dispatchers.slice();
          } else {
            return name ? this.dispatchers = this._filter(name, this.dispatchers) : this.dispatchers.slice();
          }
        })
      );
    this.disputeForm.get('customer').valueChanges.subscribe(val => {
      this.selectedCustomer = val;
    });
    this.disputeForm.get('driver').valueChanges.subscribe(val => {
      this.selectedDriver = val;
    });
  }

  displayFn(user?: User): string | undefined {
    return user ? user.name : undefined;
  }

  private _filter(name: string, collection: any[]): User[] {
    const filterValue = name.toLowerCase();

    return collection.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  // handle form submission
  onSubmit() {
    this.loading = true;
    this.disputeService.addDispute(this.disputeForm.value).toPromise()
      .then(data => {
        this.loading = false;
        this.snackBar.open('Successfully Submitted Dispute', 'OK', {
          duration: 2000
        });
      })
      .then(() => {
        return this.tripService.updateTrip(this.trip_id, {
          dispute: this.disputeForm.value
        });
      })
      .then(data => {
        this.dialogRef.close();
      })
      .catch(err => {
        this.snackBar.open('Something Went Wrong', 'OK', {
          duration: 2000
        });
        this.loading = false;
        this.dialogRef.close();
      });
  }
}
