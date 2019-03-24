import {Router} from '@angular/router';
import {Trip, User} from '../../shared/models';
import {AuthService, TripService, UserService} from '../../shared/services';
import {TripStatus, UrlConfig} from '../../shared/configs';
import {FileUploader} from 'ng2-file-upload';
import {LogUtil} from '../../shared/utils';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ServerResponse} from '../../shared/interfaces';

interface ImageResponse {
    success: boolean;
    file_name: string;
}

@Component({
    selector: 'app-dispatcher',
    templateUrl: './dispatcher.component.html',
    styleUrls: ['./dispatcher.component.scss']
})
export class DispatcherComponent implements OnInit {

    loaded = false;

    uploader: FileUploader = new FileUploader({url: UrlConfig.UPLOAD_URL});
    hasBaseDropZoneOver = false;
    currentImageName = '';
    avatarUrl = UrlConfig.getFullDefaultAvatar();

    user: User = {avatar_url: UrlConfig.DEFAULT_AVATAR};
    dispatcher: User;
    COLORS = {'arrived': 'teal', 'cancelled': 'red', 'started': 'blue', 'pending': 'gray'};

    private LABEL_COLORS = {
        accepted: 'teal',
        pending: '#ff4081',
        started: 'primary',
        arrived: 'green',
        cancelled: 'red',
        scheduled: 'orange'
    };

    trips: Trip[] = [];
    pendingDataSource = new MatTableDataSource([]);
    pendingTripsLength: Number;
    activeDataSource = new MatTableDataSource([]);
    activeTripsLength: Number;
    completedDataSource = new MatTableDataSource([]);
    completedTripsLength: Number;
    cancelledDataSource = new MatTableDataSource([]);
    cancelledTripsLength: Number;
    scheduledDataSource = new MatTableDataSource([]);
    scheduledTripsLength: Number;

    displayedColumns = ['driver_name', 'customer_name', 'trip_status', 'starting_location', 'destination_location', 'call_time'];

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    // Doughnut
    public doughnutChartLabels = ['Cancelled Trips', 'Completed Trips', 'Pending Trips'];
    public doughnutChartData = [350, 450, 100];
    public doughnutChartType = 'doughnut';

    constructor(
        private userService: UserService,
        private router: Router,
        private authService: AuthService,
        private tripService: TripService
    ) {
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            const resp = JSON.parse(response) as ImageResponse;
            if (resp.success) {
                const file_name = resp.file_name;
                this.avatarUrl = `${UrlConfig.DOMAIN_URL}${file_name}?random=${Date.now()}`;
            } else {
                LogUtil.AlertNag(`Image upload failed, status: ${status}, headers: ${headers}`);
            }
        };
        this.uploader.onAfterAddingFile = (item) => {
            this.currentImageName = item.file.name;
            this.uploadImage();
        };
        this.dispatcher = this.authService.getAuthUser();
        this.tripService.getTripByDispatcherId(this.dispatcher._id).then(
            (data: ServerResponse) => {
                this.trips = data.data;
                this.activeDataSource.data = this.trips.filter(tr => tr.trip_status ===
                    TripStatus.ARRIVED || tr.trip_status === TripStatus.STARTED ||
                    tr.trip_status === TripStatus.ACCEPTED);
                this.activeTripsLength = this.activeDataSource.data.length;
                this.cancelledDataSource.data = this.trips.filter(tr => tr.trip_status === TripStatus.CANCELLED);
                this.cancelledTripsLength = this.cancelledDataSource.data.length;
                this.pendingDataSource.data = this.trips.filter(tr => tr.trip_status === TripStatus.PENDING);
                this.pendingTripsLength = this.pendingDataSource.data.length;
                this.scheduledDataSource.data = this.trips.filter(tr => tr.is_scheduled);
                this.scheduledTripsLength = this.scheduledDataSource.data.length;
                this.completedDataSource.data = this.trips.filter(tr => tr.trip_status === TripStatus.COMPLETED);
                this.completedTripsLength = this.completedDataSource.data.length;
                this.loaded = true;
                // set trip history stats
                this.doughnutChartData[0] = this.trips.filter(tr => tr.trip_status === TripStatus.CANCELLED).length;
                this.doughnutChartData[1] = this.trips.filter(tr => tr.trip_status ===
                    TripStatus.COMPLETED).length;
                this.doughnutChartData[2] = this.trips.filter(tr => tr.trip_status
                    !== TripStatus.CANCELLED && tr.trip_status !== TripStatus.COMPLETED).length;
            }
        );

    }

    ngOnInit(): void {
        this.activeDataSource.sort = this.sort;
        this.activeDataSource.paginator = this.paginator;
        this.completedDataSource.sort = this.sort;
        this.completedDataSource.paginator = this.paginator;
        this.cancelledDataSource.sort = this.sort;
        this.cancelledDataSource.paginator = this.paginator;
        this.pendingDataSource.sort = this.sort;
        this.pendingDataSource.paginator = this.paginator;
        this.scheduledDataSource.sort = this.sort;
        this.scheduledDataSource.paginator = this.paginator;
    }


    applyFilter(filterValue: string) {
    }

    // events
    public chartClicked(e: any): void {
        console.log(e);
    }

    public chartHovered(e: any): void {
        console.log(e);
    }

    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
        for (const item of this.uploader.queue) {
            this.currentImageName = item.file.name;
        }
    }

    uploadImage() {
        LogUtil.ConsoleNag('uploading image');
        for (const item of this.uploader.queue) {
            item.upload();
        }
    }

    cancelUploadImage() {
        this.avatarUrl = UrlConfig.getFullDefaultAvatar();
        this.currentImageName = '';
    }

}
