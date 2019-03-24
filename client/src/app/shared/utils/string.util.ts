import { UrlConfig } from '../configs';
export function makeAvatarUrl(url: string) {
    if (url.indexOf('/uploads') !== -1) {
        return UrlConfig.DOMAIN_URL + url.split('/uploads')[1];
    }
    return url;
}
