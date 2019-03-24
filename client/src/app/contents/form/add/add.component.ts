import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ServerResponse } from '../../../shared/interfaces';
import { FormComponent } from '../FormComponent';
import { FormBuilder } from '@angular/forms';
import * as XLSX from 'xlsx';
import { User } from '../../../shared/models';
import { MatSnackBar } from '@angular/material';
import { UserService } from '../../../shared/services';
import { handleError, LogUtil } from '../../../shared/utils';

@Component({
    selector: 'app-add',
    templateUrl: '../form.component.html',
    styleUrls: ['../form.component.scss']
})
export class AddComponent extends FormComponent implements OnInit {

    constructor(
        fb: FormBuilder,
        userService: UserService,
        changeDetectRef: ChangeDetectorRef,
        snackBar: MatSnackBar,
        router: Router
    ) {
        super(fb, userService, true, snackBar, router);
    }

    arrayBuffer: any;
    file: File;
    file_name = 'choose an excel file';

    ngOnInit() {
    }

    onSubmit() {
        this.loaded = false;
        this.user = this.getFormUser();
        LogUtil.ConsoleNag('user: ' + JSON.stringify(this.user));
        this.userService.addUser(this.user).subscribe(
            response => {
                this.handleAddResponse(response);
                this.loaded = true;
            },
            err => {
                this.handleAddResponse(err);
                this.loaded = true;
            }
        );
    }

    onFileInput(event) {
        this.file = event.target.files[0];
        this.file_name = this.file.name;
        console.log(event.target.files);
    }

    onAddFromFile() {
        this.loaded = true;

        this.user = {
            working_hours: {
                start: '',
                end: ''
            }
        };

        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.arrayBuffer = fileReader.result;
            const data = new Uint8Array(this.arrayBuffer);
            const arr = [];
            for (let i = 0; i !== data.length; ++i) {
                arr[i] = String.fromCharCode(data[i]);
            }
            const binaryString = arr.join('');
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const first_sheet_name = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[first_sheet_name];
            const json_format = XLSX.utils.sheet_to_json(worksheet);
            const users: User[] = [];
            for (let i = 0; i < json_format.length; i++) {
                users[i] = {
                    working_hours: {
                        start: '',
                        end: ''
                    }
                };
                users[i].name = json_format[i]['name'];
                users[i].email = json_format[i]['email'];
                users[i].phone = json_format[i]['phone'];
                users[i].password = json_format[i]['password'];
                users[i].card_number = json_format[i]['card number'];
                users[i].plate_number = json_format[i]['plate_number'];
                users[i].working_hours.start = json_format[i]['starting hour'];
                users[i].working_hours.end = json_format[i]['end hour'];
                if (!users[i].password) {
                    users[i].password = '8707';
                }
            }
            console.log(users);
            this.userService.addMultipleUsers(users)
                .subscribe(
                    response => this.handleAddResponse(response),
                    error => handleError(error)
                );
        };
        fileReader.readAsArrayBuffer(this.file);
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 2000
        });
    }

    handleAddResponse(resp: ServerResponse) {
        if (resp.success) {
            this.openSnackBar('Successfully Added ' + this.userService.getManagedUserLabel(), 'OK');
            this.loaded = true;
        } else {
            this.openSnackBar('Something went wrong', 'OK');
            LogUtil.ConsoleNag(resp.error);
            this.loaded = true;
        }
    }

}
