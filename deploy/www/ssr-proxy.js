const { SsrProxy } = require('ssr-proxy-js');

const targetRoute = process.env.ENV === 'dev' ? 'http://invest-tester' : 'https://www.investtester.com';

const ssrProxy = new SsrProxy({
    httpPort: 8080,
    hostname: '0.0.0.0',
    targetRoute: targetRoute,
    proxyOrder: ['SsrProxy', 'HttpProxy'],
    isBot: true,
    reqMiddleware: async (params) => {
        params.targetUrl.search = '';
        return params;
    },
    resMiddleware: async (params, result) => {
        if (result.text == null) return result;
        if (result.contentType.includes('html'))
            result.text = result.text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        return result;
    },
    ssr: {
        browserConfig: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], timeout: 60000 },
        queryParams: [{ key: 'headless', value: 'true' }],
        allowedResources: ['document', 'script', 'xhr', 'fetch'],
        waitUntil: 'networkidle0',
        timeout: 60000,
    },
    httpProxy: {
        shouldUse: true,
        timeout: 60000,
    },
    static: {
        shouldUse: false,
    },
    log: {
        level: 3,
        console: { enabled: true },
        file: { enabled: false },
    },
    cache: {
        shouldUse: params => params.proxyType === 'SsrProxy',
        maxEntries: 50,
        maxByteSize: 50 * 1024 * 1024, // 50MB
        expirationMs: 25 * 60 * 60 * 1000, // 25h
        autoRefresh: {
            enabled: true,
            shouldUse: true,
            proxyOrder: ['SsrProxy', 'HttpProxy'],
            initTimeoutMs: 3 * 60 * 1000, // 3m
            intervalCron: '0 0 3 * * *', // every day at 3am
            intervalTz: 'America/Sao_Paulo',
            retries: 3,
            parallelism: 1,
            isBot: true,
            routes: [
                { method: 'GET', url: '/' },
                { method: 'GET', url: '/algo-trading' },
                { method: 'GET', url: '/docs' },
            ],
        },
    },
});

ssrProxy.start();