import axios, { AxiosRequestConfig } from 'axios';

// Cancel Token

const createCancelToken = () => {
    const cts = axios.CancelToken.source();

    // Allows axios to get up to date cancel token
    (cts as any)._token = cts.token;
    cts.token = new Proxy(cts.token, {
        get: (obj, prop, proxy) => {
            return (HttpServiceCts as any)._token[prop];
        },
    });

    return cts;
};

const HttpServiceCts = createCancelToken();

export const HttpServiceAbort = () => {
    HttpServiceCts.cancel();
    Object.assign(HttpServiceCts, { ...createCancelToken() });
};

// Axios Instances

const _HttpService = axios.create({
    timeout: 60000,
    cancelToken: HttpServiceCts.token,
});

const _HttpServiceNoAbort = axios.create({
    timeout: 60000,
});

// Interceptors

// const onRequestFulfilled = async (config: AxiosRequestConfig) => {
//     const authService = container.resolve(AuthService);
//     const token = await authService.getToken();
//     if (token) config.headers['Authorization'] = 'Bearer ' + token;
//     return config;
// };

// const onResponseRejected = (err: any) => {
//     const isUnauthorized = err?.response?.status === 401 || err?.message === 'Request failed with status code 401';
//     const isRefresh = /\/api\/Auth\/RenewToken\/?/.test(err?.config?.url);

//     if (isUnauthorized) {
//       const authService = container.resolve(AuthService);

//       const logout = async () => {
//         await authService.logout();
//         window.location.href = '/login';
//       };

//       if (!isRefresh) {
//         return authService.renewToken()
//           .catch(() => logout())
//           .then(async user => {
//             if (user == null) await logout();
//             return _HttpService.request(err.config);
//           });
//       } else {
//         return logout();
//       }
//     }

//     return Promise.reject(err);
// };

// _HttpService.interceptors.request.use(onRequestFulfilled, undefined);
// _HttpService.interceptors.response.use(undefined, onResponseRejected);

// _HttpServiceNoAbort.interceptors.request.use(onRequestFulfilled, undefined);
// _HttpServiceNoAbort.interceptors.response.use(undefined, onResponseRejected);

export const HttpService = _HttpService;
export const HttpServiceNoAbort = _HttpServiceNoAbort;
