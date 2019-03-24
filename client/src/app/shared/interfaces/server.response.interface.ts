export interface ServerResponse {
    status: number;
    success?: boolean;
    error?: string;
    data?: any;
    msg?: string;
    token?: string;
}
