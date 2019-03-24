import {Component, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {User} from '../shared/models';
import {ServerResponse} from '../shared/interfaces';
import {RouteConfig} from '../shared/configs';
import {Level} from '../shared/configs';
import {AuthService} from '../shared/services';
import {LogUtil} from '../shared/utils';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    constructor(private router: Router, private fb: FormBuilder, private authService: AuthService) {
        this.loginForm = fb.group({
            email: new FormControl(null, [Validators.required, Validators.email]),
            password: new FormControl(null, [Validators.required, Validators.minLength(4)])
        });
    }

    loading = false;
    user: User = {
        email: '',
        password: ''
    };
    loginForm: FormGroup;

    serverError = false;
    serverErrorMessage = '';

    ngOnInit() {
    }

    onLogin() {
        this.loading = true;
        this.user.email = this.loginForm.value.email;
        this.user.password = this.loginForm.value.password;
        this.authService.loginUser(this.user)
            .subscribe(
                response => this.handleAuthResponse(response),
                error => {
                    const err = error as HttpErrorResponse;
                    let msg = '';
                    if (err.status === 403) {
                        msg = 'Invalid email or password, please try again!';
                        this.setServerError(true, msg);
                    } else {
                        msg = `Error authenticating, status: ${err.status} `;
                        this.setServerError(true, msg);
                    }
                    this.loading = false;
                    LogUtil.ConsoleNag(this.loading + 'loading');
                }
            );
    }

    handleAuthResponse(resp: ServerResponse) {
        if (resp.success) {
            if (this.authService.getManagingUserLevel() === Level.DISPATCHER) {
                this.router.navigateByUrl(RouteConfig.ROUTE_TRIP).catch(reason => {
                    LogUtil.ConsoleNag('Could not navigate to search: ' + reason);
                });
            } else if (this.authService.getManagingUserLevel() === Level.FINANCE ) {
                this.router.navigateByUrl(RouteConfig.ROUTE_FINANCE).catch(reason => {
                    LogUtil.ConsoleNag('Could not navigate to finance view trip: ' + reason);
                });
            } else if (this.authService.getManagingUserLevel() === Level.DATA_ANALYST ) {
                this.router.navigateByUrl(RouteConfig.ROUTE_DATA_ANALYST).catch(reason => {
                    LogUtil.ConsoleNag('Could not navigate to data analyst view trip: ' + reason);
                });
            } else {
                this.router.navigateByUrl(RouteConfig.ROUTE_BLANK_PAGE).catch(reason => {
                    LogUtil.ConsoleNag('Could not navigate to search: ' + reason);
                });
            }
        } else {
            LogUtil.ConsoleNag('SERVER ERROR: ' + JSON.stringify(resp.error));
            this.setServerError(true, resp.error);
        }
    }

    setServerError(value: boolean, msg?: string) {
        LogUtil.ConsoleNag(msg);
        this.serverError = value;
        this.serverErrorMessage = msg;
        this.loginForm.markAsPristine();
    }
}
