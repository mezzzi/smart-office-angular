export enum Level {
    FINANCE = 'finance',
    DISPATCHER = 'dispatcher',
    SUPERVISOR = 'supervisor',
    CORPORATE_CLIENT = 'corporate_client',
    ADMIN = 'admin',
    DRIVER = 'driver',
    CUSTOMER = 'customer',
    DATA_ANALYST = 'data_analyst',
    DISPATCHER_SUPERVISOR = 'dispatcher_supervisor'
}

export function getLevel(level_string: string): Level {
    switch (level_string) {
        case Level.ADMIN:
            return Level.ADMIN;
        case Level.SUPERVISOR:
            return Level.SUPERVISOR;
        case Level.DISPATCHER:
            return Level.DISPATCHER;
        case Level.FINANCE:
            return Level.FINANCE;
        case Level.CORPORATE_CLIENT:
            return Level.CORPORATE_CLIENT;
        case Level.CUSTOMER:
            return Level.CUSTOMER;
        case Level.DRIVER:
            return Level.DRIVER;
        case Level.DATA_ANALYST:
            return Level.DATA_ANALYST;
        case Level.DISPATCHER_SUPERVISOR:
            return Level.DISPATCHER_SUPERVISOR;
        default:
            // window.alert(`Invalid level string: ${level_string}, can not convert to type Level`);
            return undefined;
    }
}
