import {Component, OnInit} from '@angular/core';
import {MainService, UserService} from '../shared/services';
import {Level, RouteConfig} from '../shared/configs';
import {LogUtil} from '../shared/utils';
import {Router} from '@angular/router';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

    constructor(private userService: UserService,
                private mainService: MainService,
                private router: Router) {
    }

    ngOnInit() {
    }

    get toBeAdded(): string {
        return this.userService.getManagedUserLabel();
    }


    get isShowingSideBar(): boolean {
        return this.mainService.isShowingSideBar();
    }

    get sideBarState(): string {
        return this.isShowingSideBar ? 'expanded' : 'collapsed';
    }

    get isShowingAddForm(): boolean {
        return this.mainService.isShowingAddForm();
    }

    showAddForm() {
        const managedUserLevel = this.userService.getManagedUserLevel();
        let routeLabel = '';
        if (managedUserLevel === Level.DISPATCHER) {
            routeLabel = RouteConfig.ROUTE_ADD_DISPATCHER;
        } else if (managedUserLevel === Level.CORPORATE_CLIENT) {
            routeLabel = RouteConfig.ROUTE_ADD_CORPORATE;
        } else if (managedUserLevel === Level.CUSTOMER) {
            routeLabel = RouteConfig.ROUTE_ADD_CUSTOMER;
        } else if (managedUserLevel === Level.DRIVER) {
            routeLabel = RouteConfig.ROUTE_ADD_DRIVER;
        } else if (managedUserLevel === Level.SUPERVISOR) {
            routeLabel = RouteConfig.ROUTE_ADD_SUPERVISOR;
        } else if (managedUserLevel === Level.FINANCE) {
            routeLabel = RouteConfig.ROUTE_ADD_FINANCE;
        } else {
            routeLabel = null;
            LogUtil.AlertNag('Invalid managed user level for show AddForm');
        }
        if (routeLabel !== null) {
            this.router.navigate([routeLabel]).catch(
                reason => {
                    LogUtil.ConsoleNag(`Could not navigate to route: ${routeLabel}, reason: ${reason}`);
                }
            );
        }
    }

}
