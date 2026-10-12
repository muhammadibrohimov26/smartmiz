import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin',
    },
    sitemap: 'https://www.smartmiz.uz/sitemap.xml',
    host: 'https://www.smartmiz.uz',
  }
}
