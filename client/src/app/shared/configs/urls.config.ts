export class UrlConfig {
    static readonly DOMAIN_URL = 'http://localhost:3000/';
    static readonly API_URL = `${UrlConfig.DOMAIN_URL}api/v1/`;
    static readonly USER_URL = `${UrlConfig.API_URL}user`;
    static readonly ADMIN_URL = `${UrlConfig.API_URL}user/admin`;
    static readonly DISPATCHER_SUPERVISOR_URL = `${UrlConfig.API_URL}user/dispatcher_supervisor`;
    static readonly SUPERVISOR_URL = `${UrlConfig.API_URL}user/supervisor`;
    static readonly DISPATCHER_URL = `${UrlConfig.API_URL}user/dispatcher`;
    static readonly DRIVER_URL = `${UrlConfig.API_URL}user/driver`;
    static readonly CUSTOMER_URL = `${UrlConfig.API_URL}user/customer`;
    static readonly CORPORATE_URL = `${UrlConfig.API_URL}corporate`;
    static readonly LOCATION_URL = `${UrlConfig.API_URL}location`;
    static readonly LOGIN_URL = `${UrlConfig.API_URL}login`;
    static readonly TRIP_URL = `${UrlConfig.API_URL}trip`;
    static readonly TRIP_URL__PENDING = `${UrlConfig.API_URL}trip/pending`;
    static readonly TRIP_URL__ACCEPTED = `${UrlConfig.API_URL}trip/accepted`;
    static readonly TRIP_URL__STARTED = `${UrlConfig.API_URL}trip/started`;
    static readonly TRIP_URL__ARRIVED = `${UrlConfig.API_URL}trip/arrived`;
    static readonly TRIP_URL__COMPLETED = `${UrlConfig.API_URL}trip/completed`;
    static readonly TRIP_URL__REPORT__DAY = `${UrlConfig.API_URL}trip/report/day`;
    static readonly TIMESTAMP_URL = `${UrlConfig.API_URL}timestamp`;
    static readonly UPLOAD_URL = `${UrlConfig.DOMAIN_URL}images`;
    static readonly DEFAULT_AVATAR = '/uploads/anonymous.png';
    static readonly SEARCH_TRIP_URL = `${UrlConfig.API_URL}trip/search`;
    static readonly SEARCH_TRIP_BY_DISPATCHER_URL = `${UrlConfig.API_URL}trip/dispatcher`;
    static readonly FINANCE_URL = `${UrlConfig.API_URL}user/finance`;
    static readonly DATAANALYST_URL = `${UrlConfig.API_URL}user/data-analyst`;
    static readonly EXPORT_URL__TRIP = `${UrlConfig.API_URL}export/trip`;
    static readonly EXPORT_URL__CUSTOMER = `${UrlConfig.API_URL}export/customer`;
    static readonly EXPORT_URL__DISPATCHER = `${UrlConfig.API_URL}export/dispatcher`;
    static readonly EXPORT_URL__SUPERVISOR = `${UrlConfig.API_URL}export/supervisor`;
    static readonly EXPORT_URL__ADMIN = `${UrlConfig.API_URL}export/admin`;
    static readonly EXPORT_URL__CORPORATE_CLIENT = `${UrlConfig.API_URL}export/corporate_client`;
    static readonly DISPUTE_URL = `${UrlConfig.API_URL}dispute`;
    static readonly SHIFT_REPORT_URL = `${UrlConfig.API_URL}shift_report`;

    static getFullDefaultAvatar(): string {
        return `${UrlConfig.DOMAIN_URL}${UrlConfig.DEFAULT_AVATAR.split('/')[2]}`;
    }
}
