import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {ServerResponse} from '../../../shared/interfaces';
import {switchMap} from 'rxjs/operators';
import {FormComponent} from '../FormComponent';
import {FormBuilder} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {UserService} from '../../../shared/services';
import {handleError, LogUtil} from '../../../shared/utils';
import {UrlConfig} from '../../../shared/configs';

@Component({
    selector: 'app-edit',
    templateUrl: '../form.component.html',
    styleUrls: ['../form.component.scss']
})
export class EditComponent extends FormComponent implements OnInit {

    constructor(
        fb: FormBuilder,
        changeDetectRef: ChangeDetectorRef,
        userService: UserService,
        router: Router,
        protected snackBar: MatSnackBar,
        private route: ActivatedRoute) {
        super(fb, userService, false, snackBar, router);
    }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.userService.getUserById(params.get('id')))
        ).subscribe(
            response => this.handleSearchResponse(response),
            error => handleError(error)
        );
    }

    onSubmit() {
        const usr = this.getFormUser();
        usr._id = this.user._id;
        LogUtil.ConsoleNag('user: ' + JSON.stringify(this.user));
        this.userService.updateUser(usr).subscribe(
            response => this.handleUpdateResponse(response),
        );
    }

    handleUpdateResponse(resp: ServerResponse) {
        if (resp.success) {
            LogUtil.AlertNag('Successfully updated');
        } else {
            LogUtil.AlertNag('Could not update');
            LogUtil.ConsoleNag(resp.error);
        }
    }

    handleSearchResponse(resp: any) {
        if (resp.success) {
            this.user = resp.data;
            this.user.password = '';
            LogUtil.ConsoleNag('user to edit: ' + JSON.stringify(this.user));
            let img_url = `${UrlConfig.DOMAIN_URL}/${this.user.avatar_url.split('uploads/')[1]}`;
            if (img_url.endsWith('undefined')) {
                img_url = UrlConfig.getFullDefaultAvatar();
            }
            this.avatarUrl = `${img_url}?random=${Date.now()}`;
            LogUtil.ConsoleNag(`calculated: ${this.avatarUrl}`);
            this.userForm.patchValue(this.user);
            if (this.isCorporate) {
                this.userForm.patchValue({
                    'corporateName': this.user.name,
                });
            } else {
                const firstAndLast = this.user.name.split(' ');
                if (firstAndLast.length > 1) {
                    this.firstName = firstAndLast[0];
                    this.lastName = firstAndLast[1];
                } else {
                    this.firstName = this.user.name;
                    this.lastName = '';
                }
                this.userForm.patchValue({
                    'firstName': this.firstName,
                    'lastName': this.lastName
                });
            }
        } else {
            LogUtil.AlertNag('Could not find user');
            LogUtil.ConsoleNag(resp.error);
        }
    }

}
