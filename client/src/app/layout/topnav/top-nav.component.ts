import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {AuthService, MainService, TripService, UserService} from '../../shared/services';
import {RouteConfig, Label, Level} from '../../shared/configs';
import {User} from '../../shared/models';
import {LogUtil} from '../../shared/utils';
import {saveAs} from 'file-saver';
import {
    MatBottomSheet, MatBottomSheetRef, MatBottomSheetConfig, MatSnackBar,
    MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatDialogConfig
} from '@angular/material';
import {Trip} from '../../shared/models';
import {ShiftReportComponent} from '../../contents/shift-report/shift-report.component';

@Component({
    selector: 'app-trip-otifications',
    template: `<mat-nav-list *ngFor = "let trip of scheduledTrips">
    <a mat-list-item style="margin-bottom:10px;" (click)="openNotifiedTrip(trip, $event)">
    <mat-chip-list>
      <span mat-line>#received By
          <mat-chip color="accent" selected>
                {{trip.received_by.name}}
          </mat-chip>
      </span>
      <span mat-line>#scheduled For
          <mat-chip color="primary" selected>
               {{trip.scheduled_date | date:'medium'}}
          </mat-chip>
      </span>
      </mat-chip-list>
    </a>
    </mat-nav-list>`,
})
export class TripNotificationsComponent {

    scheduledTrips: Trip[] = [];

    constructor(private tripService: TripService,
                private dialogRef: MatDialogRef<TripNotificationsComponent>,
    ) {
        this.scheduledTrips = this.tripService.getScheduledTrips();
    }

    openNotifiedTrip(trip: Trip, event: MouseEvent): void {
        // this.bottomSheetRef.dismiss();
        this.dialogRef.close();
        event.preventDefault();
        this.tripService.setFilteredTripToDisplay(trip);

    }

}

@Component({
    selector: 'app-top-nav',
    templateUrl: './top-nav.component.html',
    styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {
    pushRightClass: 'push-right';
    avatar: String;
    authUser: User;
    showExport = false;
    notificationsClicked = false;

    constructor(public router: Router,
                private translate: TranslateService,
                private mainService: MainService,
                private authService: AuthService,
                private tripService: TripService,
                private userService: UserService,
                private bottomSheet: MatBottomSheet,
                private snackBar: MatSnackBar,
                private dialog: MatDialog
    ) {

        this.router.events.subscribe(val => {
            if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
                this.toggleSidebar();
            }
        });

    }

    ngOnInit() {
        this.avatar = this.authService.getAuthUserAvatar();
        this.authUser = this.authService.getAuthUser();
        if (this.authUser.level === Level.FINANCE || this.authUser.level === Level.SUPERVISOR) {
            this.showExport = true;
        }
        LogUtil.ConsoleNag('this.avatar' + this.avatar);
    }

    get noOfNotifications() {
        return !!this.tripService.getScheduledTrips() ?
            (this.tripService.getScheduledTrips().length >= 99 ?
                '99+' : this.tripService.getScheduledTrips().length) : 0;

    }

    get showProfileMenu() {
        return this.authService.getAuthUser().level === Level.DISPATCHER;
    }

    showNotifications(): void {
        // const sheetConfig = new MatBottomSheetConfig();
        if (this.noOfNotifications === 0) {
            this.snackBar.open('There are no scheduled trips', 'Close', {
                duration: 2000,
            });
        } else {
            // this.bottomSheet.open(TripNotificationsComponent, sheetConfig);
            const dialogConfig = new MatDialogConfig();
            dialogConfig.position = {
                top: '70px',
                left: '775px'
            };
            const dialogRef = this.dialog.open(
                TripNotificationsComponent,
                dialogConfig
            );
            this.notificationsClicked = true;
            dialogRef.afterClosed().subscribe(() => {
                    this.notificationsClicked = false;
                }
            );
        }
    }

    showProfile() {
        LogUtil.ConsoleNag(`ASSIGNING SHOW PROFILE`);
        this.userService.setIsShowingProfile(true);
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    onLogOut() {
        if (this.authService.getManagingUserLevel() === Level.DISPATCHER ||
            this.authService.getManagingUserLevel() === Level.DISPATCHER_SUPERVISOR) {
            this.dialog.open(ShiftReportComponent, {width: '40vw'}).afterClosed().toPromise().then(() => {
                if (ShiftReportComponent.simplyHide) {
                    return;
                } else {
                    localStorage.removeItem(Label.TOKEN);
                    this.router.navigate([RouteConfig.ROUTE_LOG_IN]).catch(
                        reason => {
                            LogUtil.ConsoleNag(`Could not navigate to login on log out, reason: ${reason}`);
                        }
                    );
                }
            });
        } else {
            localStorage.removeItem(Label.TOKEN);
            this.router.navigate([RouteConfig.ROUTE_LOG_IN]).catch(
                reason => {
                    LogUtil.ConsoleNag(`Could not navigate to login on log out, reason: ${reason}`);
                }
            );
        }

    }

    changeLang(language: string) {
        this.translate.use(language);
    }

    get isDispatcherManaging(): boolean {
        return this.authService.getManagingUserLevel() === Level.DISPATCHER;
    }

    get isSupervisorManaging(): boolean {
        return this.authService.getManagingUserLevel() === Level.SUPERVISOR;
    }

    get isDispatcherSupervisorManaging(): boolean {
        return this.authService.getManagingUserLevel() === Level.DISPATCHER_SUPERVISOR;
    }

    get managePanelLabel(): string {
        return this.authService.getManagingUserLevel() === Level.SUPERVISOR ? 'Manage Panel' : 'Manage Customers';
    }

    showManagePanel() {
        if (this.authService.getManagingUserLevel() === Level.DISPATCHER) {
            this.router.navigate([RouteConfig.ROUTE_SEARCH_CUSTOMER]).catch(
                reason => {
                    LogUtil.ConsoleNag(`Could not navigate to search customer, reason: ${reason}`);
                }
            );
        } else {
            this.router.navigate([RouteConfig.ROUTE_BLANK_PAGE]).catch(
                reason => {
                    LogUtil.ConsoleNag(`Could not navigate to search customer, reason: ${reason}`);
                }
            );
        }
    }

    showDispatcherPanel() {
        this.userService.setIsShowingProfile(false);
        this.router.navigate([RouteConfig.ROUTE_TRIP]).catch(
            reason => {
                LogUtil.ConsoleNag(`Could not navigate to trip, reason: ${reason}`);
            }
        );
    }

    onExportClick() {
        this.tripService.exportTrips().toPromise()
            .then(data => {
                saveAs(data, 'trips.xlsx');
            })
            .catch(err => console.error(err));
        this.userService.exportCustomers().toPromise()
            .then(data => {
                saveAs(data, 'customers.xlsx');
            })
            .catch(err => console.error(err));
        this.userService.exportDispatcherUsers().toPromise()
            .then(data => {
                saveAs(data, 'dispatchers.xlsx');
            })
            .catch(err => console.error(err));
        this.userService.exportSupervisorUsers().toPromise()
            .then(data => {
                saveAs(data, 'supervisors.xlsx');
            })
            .catch(err => console.error(err));
        this.userService.exportAdminrUsers().toPromise()
            .then(data => {
                saveAs(data, 'admins.xlsx');
            })
            .catch(err => console.error(err));
        this.userService.exportCorporateClient().toPromise()
            .then(data => {
                saveAs(data, 'corporate_clients.xlsx');
            })
            .catch(err => console.error(err));
    }

}
