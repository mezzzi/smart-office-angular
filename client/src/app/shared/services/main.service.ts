import {Injectable} from '@angular/core';

@Injectable()
export class MainService {

    // used for toggling the sidebar
    private is_showing_side_bar = true;
    // used for toggling the floating add button
    private is_showing_add_form = false;

    setIsShowingSideBar(showing: boolean) {
        this.is_showing_side_bar = showing;
    }

    isShowingSideBar(): boolean {
        return this.is_showing_side_bar;
    }

    setIsShowingAddForm(showing: boolean) {
        this.is_showing_add_form = showing;
    }

    isShowingAddForm(): boolean {
        return this.is_showing_add_form;
    }

}
