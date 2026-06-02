import { Helmet } from 'react-helmet-async'
import { FlashSaleBanner } from '@/components/landing/FlashSaleBanner'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustedBy } from '@/components/landing/TrustedBy'
import { CategorySection } from '@/components/landing/CategorySection'
import { FeaturedCourses } from '@/components/landing/FeaturedCourses'
import { StatsSection } from '@/components/landing/StatsSection'
import { TestimonialSlider } from '@/components/landing/TestimonialSlider'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Sudemy | Nền Tảng Học AI Thực Chiến Số 1 Việt Nam</title>
        <meta name="description" content="Học ChatGPT, Gemini, Canva AI, CapCut AI qua các dự án thực chiến. Nâng cao hiệu suất công việc với nền tảng học AI hàng đầu Việt Nam." />
        <meta property="og:title" content="Sudemy | Học AI Thực Chiến" />
        <meta property="og:description" content="Làm chủ công cụ AI và tăng x3 hiệu suất công việc. Đăng ký học ngay hôm nay!" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" /> {/* Fallback or actual path to image */}
      </Helmet>

      <main className="flex flex-col min-h-screen">
        <FlashSaleBanner />
        <HeroSection />
        <TrustedBy />
        <CategorySection />
        <FeaturedCourses />
        <StatsSection />
        <TestimonialSlider />
      </main>
    </>
  )
}
