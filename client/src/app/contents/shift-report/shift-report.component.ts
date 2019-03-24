import { Component, OnInit } from '@angular/core';
import { ShiftReportService } from '../../shared/services/shift-report.service';
import { FormGroup, FormControl } from '@angular/forms';
import { TripService, AuthService } from '../../shared/services/index';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Trip } from '../../shared/models';
import { LogUtil } from '../../shared/utils';

@Component({
    selector: 'app-shift-report',
    templateUrl: './shift-report.component.html',
    styleUrls: ['./shift-report.component.scss']
})
export class ShiftReportComponent implements OnInit {
    static simplyHide = false;
    loaded = false;
    public loading = false;
    private shiftReportForm: FormGroup;
    private acceptedTrips: Trip[];
    private bookings: Trip[];

    constructor(private shiftReportService: ShiftReportService,
        private dialogRef: MatDialogRef<ShiftReportComponent>,
        private tripService: TripService,
        private authService: AuthService) {
    }

    ngOnInit() {
        this.shiftReportForm = new FormGroup({
            accepted_trips: new FormControl(null),
            bookings: new FormControl(null),
            remark: new FormControl('')
        });

        this.tripService.getDayTrips().toPromise()
            .then(data => {
                data.data.map(trip => {
                    this.closeOnError(trip, 'ACCEPTED');
                });
                this.acceptedTrips = data.data.filter(trip => trip.received_by && trip.received_by._id ===
                    this.authService.getAuthUser()._id);
                this.shiftReportForm.get('accepted_trips').setValue(this.acceptedTrips);
            })
            .then(() => {
                const scheduledTrips = this.tripService.getScheduledTrips().map(tr => {
                    this.closeOnError(tr, 'BOOKING');
                    return tr;
                });
                this.bookings = scheduledTrips.filter(trip => (trip.received_by &&
                    trip.received_by._id === this.authService.getAuthUser()._id));
                this.shiftReportForm.get('bookings').setValue(this.bookings);
                this.loaded = true;
            });
    }

    closeOnError(tr: Trip, msg: string) {
        if (!tr.received_by) {
            // this.dialogRef.close();
            LogUtil.ConsoleNag(`EAH NULL FOUND: message: ${msg}`);
            LogUtil.ConsoleNag(JSON.stringify(tr));
        }
    }

    onSubmit() {
        ShiftReportComponent.simplyHide = false;
        this.loading = true;
        this.shiftReportService.addShiftReport(this.shiftReportForm.value).toPromise()
            .then(data => this.loading = false)
            .then(() => this.dialogRef.close())
            .catch(err => this.loaded = false);
    }

    public closeDialog() {
        ShiftReportComponent.simplyHide = true;
        this.dialogRef.close();
    }

    ignoreAndLogout() {
        ShiftReportComponent.simplyHide = false;
        this.dialogRef.close();
    }
}
