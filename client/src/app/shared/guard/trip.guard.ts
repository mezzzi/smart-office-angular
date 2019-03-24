import {Injectable} from '@angular/core';
import {CanActivate} from '@angular/router';
import {Router} from '@angular/router';
import {RouteConfig, Level} from '../configs';
import {AuthService} from '../services';
import {LogUtil} from '../utils';

@Injectable()
export class TripGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthService) {
    }

    canActivate() {
        if (this.authService.getManagingUserLevel() === Level.DISPATCHER ||
            this.authService.getManagingUserLevel() === Level.SUPERVISOR) {
            return true;
        }
        this.router.navigate([RouteConfig.ROUTE_LOG_IN]).catch(reason => {
            LogUtil.ConsoleNag('Could not navigate to login: ' + reason, true);
        });
        return false;
    }
}
