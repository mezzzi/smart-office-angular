import { Component, OnInit } from '@angular/core';
import { AuthService, UserService } from '../../shared/services';
import { Label, Level, RouteConfig } from '../../shared/configs';
import { LogUtil } from '../../shared/utils';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    constructor(private userService: UserService, private router: Router, private authService: AuthService) {
    }

    expanded = [false, false, false, false];
    showSidebar = true;

    ngOnInit() {
        this.router.events.subscribe(url => {
            if (this.router.url.indexOf('trip') !== -1) {
                this.hideSidebar();
            }
        });
    }

    hideSidebar() {
        this.showSidebar = false;
    }

    toggleExpanded(index: number) {
        for (let i = 0; i < this.expanded.length; i++) {
            if (i === index) {
                this.expanded[index] = !this.expanded[index];
            } else {
                this.expanded[i] = false;
            }
        }
    }

    get managedUserLabel(): string {
        if (this.authService.getManagingUserLevel() === Level.FINANCE) {
            return Label.TRIP_CAPITALIZED;
        }
        return this.userService.getManagedUserLabel();
    }

    get add_route(): string[] {
        const managingUserLevel = this.authService.getManagingUserLevel();
        if (managingUserLevel === Level.ADMIN) {
            return [RouteConfig.ROUTE_ADD_SUPERVISOR];
        } else if (managingUserLevel === Level.DISPATCHER) {
            return [RouteConfig.ROUTE_ADD_CUSTOMER];
        } else if (managingUserLevel === Level.FINANCE) {
            return [RouteConfig.ROUTE_FINANCE, ''];
        } else if (managingUserLevel === Level.DATA_ANALYST) {
            return [RouteConfig.ROUTE_DATA_ANALYST];
        } else {
            // LogUtil.AlertNag('invalid managing user level for add_route');
            return null;
        }
    }

    get searchRoute(): string[] {
        const managingUserLevel = this.authService.getManagingUserLevel();
        if (managingUserLevel === Level.ADMIN) {
            return [RouteConfig.ROUTE_SEARCH_SUPERVISOR];
        } else if (managingUserLevel === Level.DISPATCHER) {
            return [RouteConfig.ROUTE_SEARCH_CUSTOMER];
        } else if (managingUserLevel === Level.FINANCE) {
            return [RouteConfig.ROUTE_FINANCE];
        } else if (managingUserLevel === Level.DATA_ANALYST) {
            return [RouteConfig.ROUTE_DATA_ANALYST];
        } else {
            // LogUtil.AlertNag('invalid managing user level for searchRoute');
            return null;
        }
    }

    get isFinanceManaging(): boolean {
        return this.authService.getManagingUserLevel() === Level.FINANCE;
    }

    get isSupervisorManaging(): boolean {
        return this.authService.getManagingUserLevel() === Level.SUPERVISOR;
    }

}
