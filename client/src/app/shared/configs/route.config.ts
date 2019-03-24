import {Level} from './levels.config';

export class RouteConfig {
    static readonly ROUTE_LOG_IN = '/login';
    static readonly ROUTE_DEFAULT = '/';
    static readonly ROUTE_ADD_DRIVER = '/add-driver';
    static readonly ROUTE_ADD_CUSTOMER = '/add-customer';
    static readonly ROUTE_ADD_FINANCE = '/add-finance';
    static readonly ROUTE_ADD_CORPORATE = '/add-corporate';
    static readonly ROUTE_ADD_DISPATCHER = '/add-dispatcher';
    static readonly ROUTE_ADD_SUPERVISOR = '/add-supervisor';
    static readonly ROUTE_ADD_DATA_ANALYST = '/add-data-analyst';
    static readonly ROUTE_DISPATCHER_DASHBOARD = '/dispatcher-dashboard';
    static readonly ROUTE_EDIT_DRIVER = '/edit-driver';
    static readonly ROUTE_EDIT_CUSTOMER = '/edit-customer';
    static readonly ROUTE_EDIT_CORPORATE = '/edit-corporate';
    static readonly ROUTE_EDIT_DISPATCHER = '/edit-dispatcher';
    static readonly ROUTE_EDIT_SUPERVISOR = '/edit-supervisor';
    static readonly ROUTE_EDIT_FINANCE = '/edit-finance';
    static readonly ROUTE_EDIT_DATA_ANALYST = '/edit-data-analyst';
    static readonly ROUTE_SEARCH_DRIVER = '/search-driver';
    static readonly ROUTE_SEARCH_CUSTOMER = '/search-customer';
    static readonly ROUTE_SEARCH_CORPORATE = '/search-corporate';
    static readonly ROUTE_SEARCH_SUPERVISOR = '/search-supervisor';
    static readonly ROUTE_SEARCH_DISPATCHER = '/search-dispatcher';
    static readonly ROUTE_SEARCH_FINANCE = '/search-finance';
    static readonly ROUTE_SEARCH_DATA_ANALYST = '/search-data-analyst';
    static readonly ROUTE_BLANK_PAGE = '/blank-page';
    static readonly ROUTE_TRIP = '/trip';
    static readonly ROUTE_FINANCE = '/finance';
    static readonly ROUTE_DATA_ANALYST = '/data-analyst';
    static readonly ROUTE_ADD_DISPATCHER_SUPERVISOR = '/add-dispatcher-supervisor';
    static readonly ROUTE_EDIT_DISPATCHER_SUPERVISOR = '/edit-dispatcher-supervisor';
    static readonly ROUTE_SEARCH_DISPATCHER_SUPERVISOR = '/search-dispatcher-supervisor';

    /**
     * deroutify
     * removes initial '/' from given route url
     * @param {string} path
     * @returns {string}
     */
    static deRoutify(path: string): string {
        return path.substring(1, path.length);
    }
    static parameterized(path: string, param: string): string {
        return `${path.substring(1, path.length)}/:${param}`;
    }}

export function getRouteLevel(route: string): Level {
    if (route.indexOf('customer') !== -1) {
        return Level.CUSTOMER;
    } else if (route.indexOf('driver') !== -1) {
        return Level.DRIVER;
    } else if (route.indexOf('dispatcher-supervisor') !== -1) {
        return Level.DISPATCHER_SUPERVISOR;
    } else if (route.indexOf('dispatcher') !== -1) {
        return Level.DISPATCHER;
    } else if (route.indexOf('supervisor') !== -1) {
        return Level.SUPERVISOR;
    } else if (route.indexOf('corporate') !== -1) {
        return Level.CORPORATE_CLIENT;
    } else if (route.indexOf('trip') !== -1) {
        return Level.CUSTOMER;
    } else if (route.indexOf('finance') !== -1) {
        return Level.FINANCE;
    }  else if (route.indexOf('data-analyst') !== -1) {
        return Level.DATA_ANALYST;
    } else if (route.indexOf('blank-page') !== -1) {
        return Level.CUSTOMER;
    } else {
        // default
        console.log('invalid route for route level: ' + route);
        return Level.CUSTOMER;
    }
}
