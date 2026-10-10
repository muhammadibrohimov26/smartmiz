/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Keep in sync with IMAGE_HOSTS in lib/images.ts
        remotePatterns: [
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: ['firebase-admin'],
        // Admin panel uploads images through server actions (limit: 4MB per image)
        serverActions: { bodySizeLimit: '5mb' },
    },
};

export default nextConfig;
