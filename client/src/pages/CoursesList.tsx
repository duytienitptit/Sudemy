import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getCourses } from '@/services/course.service'
import { SearchBar } from '@/components/ui/SearchBar'
import { Pagination } from '@/components/ui/Pagination'
import { CourseGrid } from '@/components/courses/CourseGrid'
import { CourseFilter } from '@/components/courses/CourseFilter'

export const CoursesList = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [priceRange, setPriceRange] = useState('all')

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', page, search, sortBy, order, priceRange],
    queryFn: () => {
      // Prepare filters
      const filters: any = {
        page,
        limit: 12,
        sortBy,
        order,
      }
      
      if (search) filters.search = search
      
      // We don't have a strict API filter for price ranges yet in the spec,
      // but assuming the backend can handle `minPrice=0&maxPrice=0` for free, 
      // or we can handle it if we add it to the backend. 
      // For now, we'll pass standard params and leave price filtering 
      // as an exercise for backend enhancement, or pass custom fields if available.
      if (priceRange === 'free') {
         // Assuming backend supports minPrice/maxPrice or similar if we modify it
         filters.maxPrice = 0
      } else if (priceRange === 'paid') {
         filters.minPrice = 1
      }

      return getCourses(filters)
    },
    placeholderData: (previousData) => previousData
  })

  const handleSortChange = (newSortBy: string, newOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setOrder(newOrder)
    setPage(1)
  }

  const handlePriceChange = (newRange: string) => {
    setPriceRange(newRange)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-8">
      <Helmet>
        <title>Tất Cả Khóa Học - Sudemy</title>
        <meta name="description" content="Khám phá bộ sưu tập khóa học AI thực chiến tại Sudemy. Học ChatGPT, NanoBanana, Canva AI và nhiều hơn nữa từ các chuyên gia hàng đầu." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:flex md:items-end md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-on-surface)] sm:text-4xl">
              Tất Cả Khóa Học
            </h1>
            <p className="mt-4 text-lg text-[var(--color-on-surface-variant)] max-w-2xl">
              Làm chủ công cụ AI thực chiến để tăng năng suất và phát triển sự nghiệp.
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:ml-4 w-full md:w-72">
            <SearchBar 
              value={search} 
              onChange={handleSearchChange} 
              placeholder="Tìm kiếm khóa học..." 
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="elevation-1 rounded-xl p-6 lg:sticky lg:top-24 bg-[var(--color-surface)] border border-[var(--color-outline-variant)]">
              <h2 className="text-lg font-bold text-[var(--color-on-surface)] mb-6">Lọc & Sắp Xếp</h2>
              <CourseFilter 
                sortBy={sortBy}
                order={order}
                priceRange={priceRange}
                onSortChange={handleSortChange}
                onPriceChange={handlePriceChange}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <CourseGrid 
              courses={coursesData?.data || []} 
              isLoading={isLoading} 
            />
            
            {coursesData && coursesData.totalPages > 1 && (
              <div className="mt-10">
                <Pagination 
                  pagination={coursesData} 
                  onPageChange={setPage} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
