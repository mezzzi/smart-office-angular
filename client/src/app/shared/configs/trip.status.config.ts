import { LogUtil } from '../utils';

export enum TripStatus {
    PRE_PENDING = 'pre_pending',
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    STARTED = 'started',
    ARRIVED = 'arrived',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed'
}

export function getTripStatus(statusString: string) {
    switch (statusString) {
        case TripStatus.PRE_PENDING:
            return TripStatus.PRE_PENDING;
        case TripStatus.PENDING:
            return TripStatus.PENDING;
        case TripStatus.ACCEPTED:
            return TripStatus.ACCEPTED;
        case TripStatus.STARTED:
            return TripStatus.STARTED;
        case TripStatus.ARRIVED:
            return TripStatus.ARRIVED;
        case TripStatus.COMPLETED:
            return TripStatus.COMPLETED;
        default:
            LogUtil.AlertNag(`unknown trip status string: ${statusString}`);
            return TripStatus.PENDING;
    }
}
