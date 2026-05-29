import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === 'development',
    // start_url (/dashboard) защищён middleware и для незалогиненного
    // пользователя редиректит на /login — подсказываем это воркеру.
    dynamicStartUrlRedirect: '/login',
    // Fallback-документ при промахе и кэша, и сети.
    // Берётся из app/~offline/page.tsx.
    fallbacks: {
        document: '/~offline',
    },
    workboxOptions: {
        disableDevLogs: true,
    },
});

const nextConfig: NextConfig = {};

export default withPWA(nextConfig);
