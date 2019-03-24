import {HttpHeaders} from '@angular/common/http';

export const defaultHttpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};
