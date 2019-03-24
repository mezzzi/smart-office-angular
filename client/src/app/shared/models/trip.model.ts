import {User} from './user.model';
import {Location} from './location.model';
import {TripStatus, CancellationCode} from '../configs';

export class Trip {
    _id?: string;
    isSaved?: boolean; // optional field, convenient for trip management on the client side
    customer: User;
    driver: User;
    starting_location: Location;
    destination_location: Location;
    price?: string;
    call_time?: Date;
    confirmation?: Date;
    arrival_time?: Date;
    start?: Date;
    time_added?: Date;
    time_cancelled?: Date;
    et_fee?: string;
    collected?: boolean;
    collected_time?: Date;
    collected_by?: User;
    credit?: boolean;
    dispute?: any;
    night?: boolean;
    km?: string;
    status?: string;
    trip_status?: TripStatus;
    scheduled_date?: Date;
    notified?: boolean;
    last_notified?: string;
    cancellation_code?: CancellationCode;
    received_by?: User;
    accepted_by?: User;
    started_by?: User;
    completed_by?: User;
    cancelled_by?: User;
    is_scheduled: boolean;
    waiting_time?: string;
    is_corporate?: boolean;
}
