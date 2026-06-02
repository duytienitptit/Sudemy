import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getCourseBySlug } from '@/services/course.service'
import { getLessonById, submitQuiz } from '@/services/lesson.service'
import { getCourseProgress, completeLesson } from '@/services/progress.service'

import VideoPlayer from '@/components/learn/VideoPlayer'
import LessonSidebar from '@/components/learn/LessonSidebar'
import QuizModal from '@/components/learn/QuizModal'
import AiTutorPanel from '@/components/learn/AiTutorPanel'
import AiTutorToggle from '@/components/learn/AiTutorToggle'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function LearnPage() {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug?: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizResults, setQuizResults] = useState<{
    score: number
    passed: boolean
    results?: {
      questionIndex: number
      selectedOption: number
      correctAnswer: number
      isCorrect: boolean
    }[]
  } | null>(null)
  const [aiTutorOpen, setAiTutorOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sudemy_sidebar_open')
    return saved !== null ? saved === 'true' : true
  })

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev
      localStorage.setItem('sudemy_sidebar_open', String(next))
      return next
    })
  }

  const { user } = useAuth()
  const isLoggedIn = !!user

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['courses', courseSlug],
    queryFn: () => getCourseBySlug(courseSlug!),
    enabled: !!courseSlug,
  })

  // Check if user is enrolled (purchased or admin/editor)
  const isEnrolled = isLoggedIn && (
    user?.role === 'admin' ||
    user?.role === 'editor' ||
    (course?._id ? user?.purchasedCourses?.includes(course._id) ?? false : false)
  )

  const { data: progress } = useQuery({
    queryKey: ['progress', course?._id],
    queryFn: () => getCourseProgress(course!._id),
    enabled: !!course?._id && isEnrolled,
    // Don't throw on 403/404 - preview users simply have no progress
    retry: false,
  })

  const lessons = course?.lessons || []
  const completedLessons = progress?.completedLessons || []
  const progressPercent = progress?.progressPercent || 0

  const currentLessonMeta = lessons.find((l) => l.slug === lessonSlug)
  const currentIndex = currentLessonMeta ? lessons.indexOf(currentLessonMeta) : -1
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  const { data: currentLesson, isLoading: isLessonLoading } = useQuery({
    queryKey: ['lessons', currentLessonMeta?._id],
    queryFn: () => getLessonById(currentLessonMeta!._id),
    enabled: !!currentLessonMeta?._id,
  })

  const completeMutation = useMutation({
    mutationFn: (quizScore?: number) => completeLesson(course!._id, currentLessonMeta!._id, quizScore),
    onSuccess: (data) => {
      queryClient.setQueryData(['progress', course?._id], {
        completedLessons: data.completedLessons,
        progressPercent: data.progressPercent,
      })
      if (!isQuizOpen) {
        toast.success('Hoàn thành bài học!')
      }
    },
  })

  const submitQuizMutation = useMutation({
    mutationFn: (answers: { questionIndex: number; selectedOption: number }[]) =>
      submitQuiz(currentLessonMeta!._id, { answers }),
    onSuccess: (data) => {
      setQuizResults({
        score: data.score,
        passed: data.passed,
        results: data.results,
      })
      
      if (data.passed) {
        completeMutation.mutate(data.score)
      }
    },
  })

  // Redirect to first uncompleted lesson (or first lesson for preview users) if no lessonSlug
  useEffect(() => {
    if (course && !lessonSlug && lessons.length > 0) {
      const firstUncompleted = progress
        ? lessons.find((l) => !progress.completedLessons.includes(l._id))
        : lessons[0]
      const targetLesson = firstUncompleted || lessons[0]
      if (targetLesson) {
        navigate(`/learn/${course.slug}/${targetLesson.slug}`, { replace: true })
      }
    }
  }, [course, progress, lessonSlug, navigate, lessons])

  if (isCourseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!course) {
    return <Navigate to="/dashboard" replace />
  }

  const handleVideoEnded = () => {
    if (currentLesson?.quiz && currentLesson.quiz.length > 0) {
      setQuizResults(null)
      setIsQuizOpen(true)
    } else {
      if (!completedLessons.includes(currentLessonMeta!._id)) {
        completeMutation.mutate(undefined)
      }
    }
  }

  const handleMarkComplete = () => {
    if (currentLesson?.quiz && currentLesson.quiz.length > 0) {
      setQuizResults(null)
      setIsQuizOpen(true)
    } else {
      completeMutation.mutate(undefined)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--color-surface-container-lowest)] overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-[var(--color-surface)] border-b border-[var(--color-outline-variant)] flex items-center px-4 gap-3 flex-shrink-0 z-10">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Thu gọn danh sách bài học' : 'Mở danh sách bài học'}
          className="p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)] transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>

        <Link
          to={`/courses/${course.slug}`}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại khóa học
        </Link>

        {/* Course title in header when sidebar is closed */}
        {!sidebarOpen && (
          <span className="text-sm font-medium text-[var(--color-on-surface)] truncate hidden sm:block ml-2">
            {course.title}
          </span>
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with smooth slide transition */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? 'w-80' : 'w-0'
          }`}
        >
          <LessonSidebar
            course={course}
            completedLessons={completedLessons}
            progressPercent={progressPercent}
            currentLessonSlug={lessonSlug}
            isEnrolled={isEnrolled}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLessonLoading ? (
              <div className="aspect-video bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : currentLesson ? (
              <>
                {currentLesson.youtubeUrl ? (
                  <VideoPlayer url={currentLesson.youtubeUrl} onEnded={handleVideoEnded} />
                ) : (
                  <div className="aspect-video bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500">
                    <p>Chưa có video cho bài học này.</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {currentLesson.title}
                    </h1>
                    {currentLesson.quiz && currentLesson.quiz.length > 0 && (
                      <p className="text-sm text-slate-500 mt-1">Bài học này có bài kiểm tra trắc nghiệm.</p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {!completedLessons.includes(currentLesson._id) ? (
                      <button
                        onClick={handleMarkComplete}
                        disabled={completeMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {currentLesson.quiz && currentLesson.quiz.length > 0 ? 'Làm bài kiểm tra' : 'Đánh dấu hoàn thành'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Hoàn thành
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                  {prevLesson ? (
                    <Link
                      to={`/learn/${course.slug}/${prevLesson.slug}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Bài trước
                    </Link>
                  ) : (
                    <div></div>
                  )}

                  {nextLesson ? (
                    <Link
                      to={`/learn/${course.slug}/${nextLesson.slug}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                    >
                      Bài tiếp theo
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div></div>
                  )}
                </div>
              </>
            ) : currentLessonMeta && !isEnrolled && !currentLessonMeta.isFree ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--color-outline)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">Bài học này yêu cầu đăng ký</h2>
                <p className="text-[var(--color-on-surface-variant)] mb-6 max-w-sm mx-auto">Mua khóa học để truy cập toàn bộ {course.totalLessons} bài học và tài nguyên đi kèm.</p>
                <a
                  href={`/courses/${course.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Xem khóa học
                </a>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">Không tìm thấy bài học.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {currentLesson?.quiz && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => {
            setIsQuizOpen(false)
            setQuizResults(null)
          }}
          quiz={currentLesson.quiz}
          onSubmit={submitQuizMutation.mutate}
          isSubmitting={submitQuizMutation.isPending}
          quizResults={quizResults}
        />
      )}

      {/* AI Tutor — only for authenticated users */}
      {isLoggedIn && course && currentLessonMeta && (
        <>
          <AiTutorToggle
            isOpen={aiTutorOpen}
            onClick={() => setAiTutorOpen((prev) => !prev)}
          />
          <AiTutorPanel
            isOpen={aiTutorOpen}
            onClose={() => setAiTutorOpen(false)}
            courseId={course._id}
            lessonId={currentLessonMeta._id}
            courseTitle={course.title}
            lessonTitle={currentLessonMeta.title}
          />
        </>
      )}
    </div>
  )
}
