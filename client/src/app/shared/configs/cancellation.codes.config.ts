export enum CancellationCode {
    CUB_NOT_FOUND = 'cub not found',
    DRIVER_LOST_CUSTOMER = 'driver lost customer',
    DRIVER_LATE = 'driver late',
    DRIVER_CANCEL_REQUEST = 'driver cancel request',
    CUSTOMER_CANCEL_REQUEST = 'customer cancel request',
    CUSTOMER_NOT_RESPONDING = 'customer not responding',
    DISPATCHER_LAPSE = 'dispatcher lapse'
}

export function getCancellationCode(codeString: string): CancellationCode {
    switch (codeString) {
        case CancellationCode.CUB_NOT_FOUND:
            return CancellationCode.CUB_NOT_FOUND;
        case CancellationCode.DRIVER_LOST_CUSTOMER:
            return CancellationCode.DRIVER_LOST_CUSTOMER;
        case CancellationCode.DRIVER_LATE:
            return CancellationCode.DRIVER_LATE;
        case CancellationCode.DRIVER_CANCEL_REQUEST:
            return CancellationCode.DRIVER_CANCEL_REQUEST;
        case CancellationCode.CUSTOMER_CANCEL_REQUEST:
            return CancellationCode.CUSTOMER_CANCEL_REQUEST;
        case CancellationCode.CUSTOMER_NOT_RESPONDING:
            return CancellationCode.CUSTOMER_NOT_RESPONDING;
        case CancellationCode.DISPATCHER_LAPSE:
            return CancellationCode.DISPATCHER_LAPSE;
        default:
            return CancellationCode.CUSTOMER_CANCEL_REQUEST;
    }
}

export function getCancellationLabel(codeString: string): string {
    switch (codeString) {
        case CancellationCode.CUB_NOT_FOUND:
            return 'Taxi Not Found';
        case CancellationCode.DRIVER_LOST_CUSTOMER:
            return 'Driver Lost Customer';
        case CancellationCode.DRIVER_LATE:
            return 'Driver Was Late';
        case CancellationCode.DRIVER_CANCEL_REQUEST:
            return 'Driver Cancelled Request';
        case CancellationCode.CUSTOMER_CANCEL_REQUEST:
            return 'Customer Cancelled Request';
        case CancellationCode.CUSTOMER_NOT_RESPONDING:
            return 'Customer Did Not Respond';
        case CancellationCode.DISPATCHER_LAPSE:
            return 'Dispatcher Lapse';
    }
}
