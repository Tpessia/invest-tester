import { changeUrl } from '@/modules/@utils';

export enum AppEnv {
    TEST = 'TEST',
    DEV = 'DEV',
    PROD = 'PROD',
}

export interface AppConfigData {
    apiUrl: string;
}

export default abstract class AppConfig {
    static get env(): AppEnv {
        if (import.meta.env.MODE === 'test') return AppEnv.TEST;
        if (import.meta.env.PROD) return AppEnv.PROD;
        if (import.meta.env.DEV) return AppEnv.DEV;
        throw new Error('Invalid environment');
    }

    private static configs: Record<AppEnv, () => AppConfigData> = {
        [AppEnv.TEST]: () => ({
            apiUrl: 'mock',
        }),
        [AppEnv.DEV]: () => ({
            apiUrl: changeUrl(window.location.origin, { port: '3000', path: '/api' }),
        }),
        [AppEnv.PROD]: () => ({
            apiUrl: changeUrl(window.location.origin, { path: '/api' }),
        }),
    }

    static get config() {
        return AppConfig.configs[AppConfig.env]();
    }

    static select<T>(selector: (config: AppConfigData) => T) {
        return selector(this.config);
    }
}

const env = AppConfig.env;
if (env !== AppEnv.TEST) console.log('ENV:', AppConfig.env);