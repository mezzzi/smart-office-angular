import {EnvConfig} from '../configs/env.config';

export class LogUtil {

    static AlertNag(msg: string) {
        if (EnvConfig.DEBUG) {
            window.alert(msg);
        }
    }

    static ConsoleNag(msg: string, error: boolean = false) {
        if (EnvConfig.DEBUG) {
            if (error) {
                console.error(msg);
            } else {
                console.log(msg);
            }
        }
    }

    static NagNag(msg: string) {
        if (EnvConfig.DEBUG) {
            window.alert(msg);
            console.log(msg);
        }
    }
}
