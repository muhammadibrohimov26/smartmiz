/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Images are served as they are, not through the image optimizer: on
        // Vercel the optimizer answered 404 for the uploaded /media/<id>
        // images and did not deliver /public ones either (the hero photo
        // only showed once it skipped the optimizer). Uploads are already
        // shrunk in the admin panel (≤ 900 KB).
        unoptimized: true,
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
