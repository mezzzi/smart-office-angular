import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NavigationStart, NavigationEnd, NavigationError, Router} from '@angular/router';
import {getRouteLevel, RouteConfig} from './shared/configs';
import {MainService, UserService} from './shared/services';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(
        private translate: TranslateService,
        private router: Router,
        private userService: UserService,
        private mainService: MainService) {

        translate.setDefaultLang('en');
        router.events.subscribe(event => {

            if (event instanceof NavigationStart) {
                // Set managed user level
                const managedUserLevel = getRouteLevel(event.url);
                if (managedUserLevel !== null) {
                    this.userService.setManagedUserLevel(managedUserLevel);
                }
                // set showing sidebar toggle
                this.mainService.setIsShowingSideBar(event.url !== RouteConfig.ROUTE_TRIP);
                // set showing add form toggle
                this.mainService.setIsShowingAddForm(
                    event.url.startsWith('/add') || event.url.startsWith('/blank')
                    || event.url.startsWith('/finance') ||
                    event.url.startsWith('/data') || event.url.startsWith('/trip'));

            }

            if (event instanceof NavigationEnd) {
                // Hide loading indicator
            }

            if (event instanceof NavigationError) {
                // Hide loading indicator
                // Present error to user
                console.log(event.error);
            }
        });
    }

    ngOnInit(): void {
    }
}
