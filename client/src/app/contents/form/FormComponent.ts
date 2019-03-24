import {Router} from '@angular/router';
import {User} from '../../shared/models';
import {UserService} from '../../shared/services';
import {Level, UrlConfig} from '../../shared/configs';
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {FileUploader} from 'ng2-file-upload';
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';
import {LogUtil} from '../../shared/utils';
import { DISABLED } from '@angular/forms/src/model';

interface ImageResponse {
    success: boolean;
    file_name: string;
}

export interface CorporateGroup {
    letter: string;
    names: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
    const filterValue = value.toLowerCase();

    return opt.filter(item => item.toLowerCase().indexOf(filterValue) === 0);
};

export class FormComponent {

    loaded = false;

    uploader: FileUploader = new FileUploader({url: UrlConfig.UPLOAD_URL});
    hasBaseDropZoneOver = false;
    currentImageName = '';
    avatarUrl = UrlConfig.getFullDefaultAvatar();

    userForm: FormGroup;

    user: User = {avatar_url: UrlConfig.DEFAULT_AVATAR};
    firstName: string;
    lastName: string;
    isAddForm = true;

    corporateGroupOptions: Observable<CorporateGroup[]>;
    corporateGroups: CorporateGroup[];

    constructor(
        protected fb: FormBuilder,
        protected userService: UserService,
        protected isAdd: boolean,
        protected snackBar: MatSnackBar,
        protected router: Router
    ) {

        this.isAddForm = isAdd;
        this.createForm();
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            const resp = JSON.parse(response) as ImageResponse;
            if (resp.success) {
                const file_name = resp.file_name;
                this.userForm.markAsDirty();
                this.userForm.markAsTouched();
                this.avatarUrl = `${UrlConfig.DOMAIN_URL}${file_name}?random=${Date.now()}`;
            } else {
                LogUtil.AlertNag(`Image upload failed, status: ${status}, headers: ${headers}`);
            }
        };
        this.uploader.onAfterAddingFile = (item) => {
            this.currentImageName = item.file.name;
            this.uploadImage();
        };
        if (this.isCustomer) {
            this.userService.getAllUsers(Level.CORPORATE_CLIENT).subscribe(
                response => this.handleCorporateSearchResponse(response),
            );
        }
    }

    private _filterGroup(value: string): CorporateGroup[] {
        if (value) {
            return this.corporateGroups
                .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
                .filter(group => group.names.length > 0);
        }
        return this.corporateGroups;
    }

    customerRequired = () => this.isCustomer ? Validators.required : null;
    corporateRequired = () => this.isCorporate ? Validators.required : null;
    driverRequired = () => this.isDriver ? Validators.required : null;
    dispatcherRequired = () => this.isDispatcher ? Validators.required : null;

    get isShowingAddForm(): boolean {
        return this.isAddForm;
    }

    createForm() {
        this.userForm = this.fb.group({
            firstName: new FormControl(null,
                Validators.compose([this.customerRequired() || this.driverRequired() || this.dispatcherRequired()])
            ),
            lastName: new FormControl(null,
                Validators.compose([this.customerRequired() || this.driverRequired() || this.dispatcherRequired()])
            ),
            corporateName: new FormControl(null, this.corporateRequired()),
            email: [null, Validators.compose([Validators.email])],
            password: new FormControl(null),
            phone: [
                null,
                Validators.compose([
                    Validators.minLength(10),
                    Validators.maxLength(13),
                    Validators.required])
            ],
            home_phone_number: new FormControl(null,
                Validators.compose([Validators.minLength(10), Validators.maxLength(10)])
            ),
            work_phone_number: new FormControl(null,
                Validators.compose([Validators.minLength(10), Validators.maxLength(10)])
            ),
            working_hours: this.fb.group({
                start: new FormControl(null, this.dispatcherRequired()),
                end: new FormControl(null, this.dispatcherRequired()),
            }),
            card_number: [
                null,
                Validators.compose([this.driverRequired(), Validators.minLength(13), Validators.maxLength(13)])
            ],
            plate_number: new FormControl(null,
                Validators.compose([
                    this.driverRequired(),
                    Validators.minLength(11),
                    Validators.maxLength(11)])
            ),
            price_deal: new FormControl(null, Validators.compose([this.corporateRequired()])),
            address: new FormControl(null, Validators.compose([this.corporateRequired()])),
            attached_corporate: new FormControl(null),
        });
        this.loaded = true;
    }

    getFormUser(): User {
        const formModel = Object.assign({}, this.userForm.value);
        LogUtil.ConsoleNag('model: ' + JSON.stringify(formModel));
        if (this.isCorporate) {
            formModel.name = formModel.corporateName as string;
            delete formModel.corporateName;
        } else {
            formModel.name = `${(formModel.firstName as string)} ${(formModel.lastName as string)}`;
        }
        formModel.avatar_url = this.avatarUrl || this.user.avatar_url;
        delete formModel.firstName;
        delete formModel.lastName;
        if (!formModel.password) {
            formModel.password = '8707';
        }
        formModel.level = this.userService.getManagedUserLevel() as string;
        return formModel as User;
    }

    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
        for (const item of this.uploader.queue) {
            this.currentImageName = item.file.name;
        }
    }

    uploadImage() {
        console.log(this.userForm);
        LogUtil.ConsoleNag('uploading image');
        for (const item of this.uploader.queue) {
            item.upload();
        }
    }

    cancelUploadImage() {
        this.avatarUrl = UrlConfig.getFullDefaultAvatar();
        this.currentImageName = '';
    }

    showEnterMessage(control_name: string) {
        return !this.userForm.get(control_name).value && this.userForm.touched;
    }

    showNotValidMessage(control_name: string) {
        return this.userForm.get(control_name).value &&
            !this.userForm.get(control_name).valid &&
            this.userForm.dirty;
    }

    handleCorporateSearchResponse(response: any) {
        if (response.success) {
            const corpGroups = {};
            let firstLetter;
            for (const user of response.data as User[]) {
                firstLetter = user.name.charAt(0);
                if (corpGroups[firstLetter] === undefined) {
                    corpGroups[firstLetter] = [];
                }
                corpGroups[firstLetter].push(user.name);
            }
            const corporateGroups = [];
            for (const letter of Object.keys(corpGroups)) {
                corporateGroups.push({
                    letter: letter,
                    names: corpGroups[letter]
                });
            }
            this.corporateGroups = corporateGroups;
            this.corporateGroupOptions = this.userForm.get('attached_corporate').valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filterGroup(value))
                );
        }
    }

    get managedUserLabel(): string {
        return this.userService.getManagedUserLabel();
    }

    get isCustomer(): boolean {
        return this.userService.getManagedUserLevel() === Level.CUSTOMER;
    }

    get isDriver(): boolean {
        return this.userService.getManagedUserLevel() === Level.DRIVER;
    }

    get isDispatcher(): boolean {
        return this.userService.getManagedUserLevel() === Level.DISPATCHER;
    }

    get isCorporate(): boolean {
        return this.userService.getManagedUserLevel() === Level.CORPORATE_CLIENT;
    }

    get isSupervisor(): boolean {
        return this.userService.getManagedUserLevel() === Level.SUPERVISOR;
    }

    get isFinance(): boolean {
        return this.userService.getManagedUserLevel() === Level.FINANCE;
    }

    get isWorkHourRequired(): boolean {
        return this.isSupervisor || this.isDispatcher || this.isDriver || this.isFinance;
    }

    get isPasswordRequired(): boolean {
        return this.isDispatcher || this.isFinance;
    }

    get workPhoneRequired(): boolean {
        return this.isCorporate || this.isCustomer;
    }

}
