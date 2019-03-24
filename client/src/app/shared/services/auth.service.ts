import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Label} from '../configs/labels.config';
import {User} from '../models/user.model';
import {JwtHelperService} from '@auth0/angular-jwt';
import {UrlConfig} from '../configs/urls.config';
import {getLevel, Level} from '../configs/levels.config';
import {tap} from 'rxjs/operators';
import {ServerResponse} from '../interfaces/server.response.interface';
import {defaultHttpOptions} from '../configs/http.config';
import {Observable} from 'rxjs';
import {handleError} from '../utils/http.util';
import {LogUtil} from '../utils/log.util';

@Injectable()
export class AuthService {

    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    getToken(): string {
        return localStorage.getItem(Label.TOKEN);
    }

    // this is the managing user
    getAuthUser(): User {
        if (this.getToken() === null) {
            return null;
        }
        const jwt_decode = new JwtHelperService();
        return jwt_decode.decodeToken(this.getToken());
    }

    getManagingUserLevel(): Level {
        return getLevel(this.getAuthUser().level);
    }

    getAuthUserAvatar() {
        if (this.getAuthUser().avatar_url.indexOf('http') !== -1) {
            return this.getAuthUser().avatar_url.split('?')[0];
        } else {
            return `${UrlConfig.DOMAIN_URL}/${this.getAuthUser().avatar_url.split('uploads/')[1]}`;
        }
    }

    loginUser(user: User): Observable<ServerResponse> {
        LogUtil.ConsoleNag(JSON.stringify(user));
        return this.http.post<ServerResponse>(UrlConfig.LOGIN_URL, user, defaultHttpOptions).pipe(
            tap(
                // response is of ServerResponse type
                response => {
                    if (response.success) {
                        if (response.token) {
                            // store only the token, everything else will be
                            // extracted from it.
                            localStorage.setItem(Label.TOKEN, response.token);
                        } else {
                            LogUtil.AlertNag('no token returned with login response');
                        }
                    }
                    return response;
                },
                // if error, intercept it here
                error => {
                    handleError(error);
                    return error;
                }
            )
        );
    }

}
