import {LogUtil} from '../utils';

export enum DriverStatus {
    AVAILABLE = 'available',
    ON_TRIP = 'on_trip',
    OFFLINE = 'offline',
    ASSIGNED = 'assigned'
}

export function getDriverStatus(statusString: string) {
    switch (statusString) {
        case DriverStatus.AVAILABLE:
            return DriverStatus.AVAILABLE;
        case DriverStatus.ON_TRIP:
            return DriverStatus.ON_TRIP;
        case DriverStatus.OFFLINE:
            return DriverStatus.OFFLINE;
        case DriverStatus.ASSIGNED:
            return DriverStatus.ASSIGNED;
        default:
            LogUtil.AlertNag(`unknown driver status string: ${statusString}`);
            return DriverStatus.AVAILABLE;
    }
}
