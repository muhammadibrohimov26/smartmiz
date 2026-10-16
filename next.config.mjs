/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Keep in sync with IMAGE_HOSTS in lib/images.ts
        remotePatterns: [
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
        ],
    },
        async rewrites() {
        return [
            { source: '/__/auth/:path*', destination: 'https://yangi-3cf87.firebaseapp.com/__/auth/:path*' },
            { source: '/__/firebase/:path*', destination: 'https://yangi-3cf87.firebaseapp.com/__/firebase/:path*' },
        ];
    },
    // "Biz haqimizda" is now the last section of the home page
    async redirects() {
        return [{ source: '/about', destination: '/#about', permanent: true }];
    },
    experimental: {
        serverComponentsExternalPackages: ['firebase-admin'],
        // Admin panel uploads images through server actions (limit: 4MB per image)
        serverActions: { bodySizeLimit: '5mb' },
    },
};

export default nextConfig;
