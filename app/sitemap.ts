import { MetadataRoute } from 'next'
import { getCourses } from '@/lib/data'
import { courseSlug, uniqueCourses } from '@/lib/courses'

// Rebuilt hourly so new courses appear
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.smartmiz.uz'
  // One page per course (/courses/<slug>)
  const courses = uniqueCourses(await getCourses()).map((c) => ({
    url: `${baseUrl}/courses/${courseSlug(c)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  return [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...courses,
    {
      url: `${baseUrl}/news`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}
