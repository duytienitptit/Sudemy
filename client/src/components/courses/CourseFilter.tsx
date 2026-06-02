interface CourseFilterProps {
  sortBy: string
  order: 'asc' | 'desc'
  priceRange: string
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void
  onPriceChange: (range: string) => void
}

export function CourseFilter({ sortBy, order, priceRange, onSortChange, onPriceChange }: CourseFilterProps) {
  return (
    <div className="space-y-6">
      {/* ── Sort Options ── */}
      <div>
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-3">
          Sắp Xếp Theo
        </h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="sort" 
              className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
              checked={sortBy === 'createdAt' && order === 'desc'}
              onChange={() => onSortChange('createdAt', 'desc')}
            />
            <span className="text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
              Mới nhất
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="sort" 
              className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
              checked={sortBy === 'totalLessons' && order === 'desc'} // Proxy for popular for now, or ratings.count
              onChange={() => onSortChange('totalLessons', 'desc')}
            />
            <span className="text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
              Phổ biến nhất
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="sort" 
              className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
              checked={sortBy === 'price' && order === 'asc'}
              onChange={() => onSortChange('price', 'asc')}
            />
            <span className="text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
              Giá: Thấp đến Cao
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="sort" 
              className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
              checked={sortBy === 'price' && order === 'desc'}
              onChange={() => onSortChange('price', 'desc')}
            />
            <span className="text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
              Giá: Cao đến Thấp
            </span>
          </label>
        </div>
      </div>

      <hr className="border-[var(--color-outline-variant)]" />

      {/* ── Price Filter ── */}
      <div>
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-3">
          Khoảng Giá
        </h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="price" 
              className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
              checked={priceRange === 'all'}
              onChange={() => onPriceChange('all')}
            />
            <span className="text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
              Tất cả
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="price" 
              className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
              checked={priceRange === 'free'}
              onChange={() => onPriceChange('free')}
            />
            <span className="text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
              Miễn phí
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="radio" 
              name="price" 
              className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
              checked={priceRange === 'paid'}
              onChange={() => onPriceChange('paid')}
            />
            <span className="text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
              Trả phí
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
