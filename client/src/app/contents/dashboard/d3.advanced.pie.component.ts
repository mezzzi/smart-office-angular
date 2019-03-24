import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { TripService } from '../../shared/services/trip.service';
import { MainService } from '../../shared/services/main.service';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Trip } from '../../shared/models/trip.model';
import { User } from '../../shared/models/user.model';
import { TripStatus } from '../../shared/configs/trip.status.config';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-d3-advanced-pie',
  template: `
    <ngx-charts-advanced-pie-chart
      [scheme]="colorScheme"
      [results]="single">
    </ngx-charts-advanced-pie-chart>
  `,
})
export class D3AdvancedPieComponent implements OnDestroy {
  colorScheme: any;
  themeSubscription: any;
  trips: Trip[];
  single = [];

  constructor(private theme: NbThemeService, private tripService: TripService, private authService: AuthService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      const colors: any = config.variables;
      this.colorScheme = {
        domain: [colors.primaryLight, colors.infoLight, colors.successLight, colors.warningLight, colors.dangerLight],
      };
      this.tripService.getDayTrips().toPromise().then(data => {
        this.trips = data.data;
        const dispatcher = authService.getAuthUser();
        this.setData(dispatcher);
      }).catch(err => {
        console.log(err);
      });
    });
  }

  setData(dispatcher: User) {
    const dispatchersTrips = this.trips.filter(trip => (trip.received_by._id === dispatcher._id) ||
      (trip.accepted_by._id === dispatcher._id) ||
      (trip.started_by._id === dispatcher._id) ||
      (trip.cancelled_by._id === dispatcher._id) ||
      (trip.completed_by._id === dispatcher._id));
    const cancelledTrips: Trip[] = [];
    const completedTrips: Trip[] = [];
    dispatchersTrips.filter(trip => {
      if (trip.trip_status === TripStatus.CANCELLED) {
        cancelledTrips.push(trip);
      }
      if (trip.trip_status === TripStatus.COMPLETED) {
        completedTrips.push(trip);
      }
    });
    this.single = [
      {
        name: 'Cancled Trips',
        value: cancelledTrips.length
      },
      {
        name: 'Completed Trips',
        value: completedTrips.length,
      },
    ];
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
