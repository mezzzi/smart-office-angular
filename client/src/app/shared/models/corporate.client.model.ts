export class CorporateClient {
    _id: string;
    waiting_deal?: number;
    night_deal?: number;
    day_deal?: number;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    base_price?: number;
    card_number?: number;
    account_status = 'active';
    time_added = Date.now();
}
