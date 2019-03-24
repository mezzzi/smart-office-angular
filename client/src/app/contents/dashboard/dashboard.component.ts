import { Component, OnDestroy } from '@angular/core';
import { NbThemeService, NbColorHelper } from '@nebular/theme';
import { TripService } from '../../shared/services/trip.service';
import { MainService } from '../../shared/services/main.service';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Trip } from '../../shared/models/trip.model';
import { User } from '../../shared/models/user.model';
import { TripStatus } from '../../shared/configs/trip.status.config';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy {
    colorScheme: any;
    month: String = 'Yearly';
    year: String;
    themeSubscription: any;
    dispatcherTrips: Trip[];
    dailyData = [];
    barChartDataSets: any = {labels: [], datasets: []};
    options: any;
    months: string[] = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    week: string[] = [
        'Mon',
        'Tue',
        'Wed',
        'Thr',
        'Fri',
        'Sat',
        'Sun'
    ];
    colors: any;


    constructor(
        private theme: NbThemeService,
        private tripService: TripService,
        private authService: AuthService
    ) {
        const dispatcherId = authService.getAuthUser()._id;
        this.year = new Date().getFullYear().toString();

        this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
            const colors: any = config.variables;
            this.colorScheme = {
                domain: [
                    colors.primaryLight,
                    colors.infoLight,
                    colors.successLight,
                    colors.warningLight,
                    colors.dangerLight
                ]
            };
            this.setOptions(config);
        });

        this.tripService
            .getTripByDispatcherId(dispatcherId)
            .then(data => {
                this.dispatcherTrips = data.data;
                this.setDailyData();
                this.setRegularData(this.months);
            })
            .catch(err => {
                console.log(err.status);
            });
    }

    showMonthlyData(chartElement: any): void {
        const month = chartElement[0]._index;
        this.month = this.months[month];
        const monthTrips = this.dispatcherTrips.filter(trip => new Date(trip.call_time).getMonth() === month);
        if (monthTrips.length > 0) {
            const date = new Date(monthTrips[0].call_time);
            const numberOfDays = new Date(date.getFullYear(), month, 0).getDate();
            const lables = Array.from(Array(numberOfDays).keys()).map(day => String(day + 1));
            this.setRegularData(lables);
        }
    }

    countNumberOfTripsBasedOnStatus(trips: Trip[]) {
        const cancelledTrips: Trip[] = [];
        const completedTrips: Trip[] = [];
        const acceptedTrips: Trip[] = [];
        const receivedTrips: Trip[] = [];
        const scheduledTrips: Trip[] = [];

        trips.filter(trip => {
            if (trip.trip_status === TripStatus.CANCELLED) {
                cancelledTrips.push(trip);
            }
            if (trip.trip_status === TripStatus.ACCEPTED) {
                acceptedTrips.push(trip);
            }
            if (trip.trip_status === TripStatus.PENDING) {
                receivedTrips.push(trip);
            }
            if (trip.trip_status === TripStatus.COMPLETED) {
                completedTrips.push(trip);
            }
            if (trip.is_scheduled === true) {
                scheduledTrips.push(trip);
            }
        });
        return {
            CanceledTrips: cancelledTrips.length,
            AcceptedTrips: acceptedTrips.length,
            ReceivedTrips: receivedTrips.length,
            CompltedTrips: completedTrips.length,
            ScheduledTrips: scheduledTrips.length
        };
    }

    setDailyData() {
        const today = new Date().getDate();
        const todaysTrips = this.dispatcherTrips.filter(
            trip => new Date(trip.call_time).getDate() === today
        );
        const countedNumbers = this.countNumberOfTripsBasedOnStatus(
            todaysTrips
        );
        this.dailyData = [
            { name: 'Completed', value: countedNumbers.CompltedTrips },
            { name: 'Cancled', value: countedNumbers.CanceledTrips },
            { name: 'Accepted', value: countedNumbers.AcceptedTrips },
            { name: 'Received', value: countedNumbers.ReceivedTrips },
            { name: 'Scheduled', value: countedNumbers.ScheduledTrips }
        ];
    }

    filterTrip(filter: number, filterNumber: number) {
        let trips = [];
        if ( filter === 12 ) {
            trips = this.dispatcherTrips.filter(
                trip =>
                    new Date(trip.call_time).getMonth() === filterNumber);
        } else if (filter > 28) {
            trips = this.dispatcherTrips.filter(
                trip =>
                    new Date(trip.call_time).getDate() === filterNumber);
        }
        return trips;
    }

    setRegularData(labels: string[]) {
        const completedTrips = [];
        const cancelledTrips = [];
        const receivedTrips = [];
        for (let i = 0; i < labels.length; i++) {
            const trips = this.filterTrip(labels.length, i);
            const countedTrips = this.countNumberOfTripsBasedOnStatus(trips);
            completedTrips.push(countedTrips.CompltedTrips);
            cancelledTrips.push(countedTrips.CanceledTrips);
            receivedTrips.push(countedTrips.ReceivedTrips);
        }
        const dataset = {
            labels: labels,
            datasets: [
                {
                    data: completedTrips,
                    label: 'Completed Trips',
                    backgroundColor: this.colors.successLight
                },
                {
                    data: cancelledTrips,
                    label: 'Canceled Trips',
                    backgroundColor: this.colors.warningLight
                },
                {
                    data: receivedTrips,
                    label: 'Received Trips',
                    backgroundColor: this.colors.infoLight
                },
            ]
        };
        this.barChartDataSets = dataset;
    }

    setOptions(config) {
        const colors: any = config.variables;
        this.colors = {
            successLight: NbColorHelper.hexToRgbA(colors.successLight, 0.8),
            warningLight: NbColorHelper.hexToRgbA(colors.warningLight, 0.8),
            infoLight: NbColorHelper.hexToRgbA(colors.infoLight, 0.8)
        };
        const chartjs: any = config.variables.chartjs;

        this.options = {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                xAxes: [
                    {
                        gridLines: {
                            display: false,
                            color: chartjs.axisLineColor
                        },
                        ticks: {
                            fontColor: chartjs.textColor
                        }
                    }
                ],
                yAxes: [
                    {
                        gridLines: {
                            display: true,
                            color: chartjs.axisLineColor
                        },
                        ticks: {
                            fontColor: chartjs.textColor
                        }
                    }
                ]
            }
        };
    }

    ngOnDestroy(): void {
        this.themeSubscription.unsubscribe();
    }
}
