import {WorkingHour} from '../interfaces';
import {DriverStatus} from '../configs/driver.status.config';
import {CorporateClient} from './corporate.client.model';

export class User {

    level?: string;
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    driver_status?: DriverStatus;
    home_phone_number?: string;
    work_phone_number?: string;
    account_status?: string;
    corporate_id?: string;
    card_number?: string;
    plate_number?: string;
    history?: any[];
    working_hours?: WorkingHour;
    attached_corporate?: CorporateClient;
    _id?: string;
    avatar_url?: string;
    address?: {
        home?: any,
        work?: any
    };
}
