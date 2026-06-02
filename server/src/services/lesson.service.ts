
import { Lesson } from '@/models/Lesson'
import { Course } from '@/models/Course'
import { Progress } from '@/models/Progress'
import { AppError } from '@/middlewares/errorHandler'
import { IUser } from '@/models/User'

export class LessonService {
  static async getCourseLessons(courseId: string, user?: IUser) {
    const course = await Course.findById(courseId).lean()
    if (!course) {
      throw new AppError('Course not found', 404)
    }

    const lessons = await Lesson.find({ courseId }).sort({ order: 1 }).lean()

    let hasPurchased = false
    if (user) {
      if (user.role === 'admin' || user.role === 'editor') {
        hasPurchased = true
      } else {
        hasPurchased = user.purchasedCourses.some(id => id.toString() === courseId)
      }
    }

    if (hasPurchased) {
      return lessons
    }

    // Return full content for free lessons, limited content for others
    return lessons.map(lesson => {
      if (lesson.isFree) {
        return lesson
      }
      return {
        _id: lesson._id,
        courseId: lesson.courseId,
        title: lesson.title,
        slug: lesson.slug,
        order: lesson.order,
        isFree: lesson.isFree,
      }
    })
  }

  static async getLessonById(id: string, user?: IUser) {
    const lesson = await Lesson.findById(id).lean()
    if (!lesson) {
      throw new AppError('Lesson not found', 404)
    }

    let hasAccess = lesson.isFree

    if (!hasAccess && user) {
      if (user.role === 'admin' || user.role === 'editor') {
        hasAccess = true
      } else {
        hasAccess = user.purchasedCourses.some(courseId => courseId.toString() === lesson.courseId.toString())
      }
    }

    if (!hasAccess) {
      throw new AppError('You must purchase the course to access this lesson', 403)
    }

    return lesson
  }

  static async createLesson(courseId: string, data: any) {
    const course = await Course.findById(courseId)
    if (!course) {
      throw new AppError('Course not found', 404)
    }

    const lesson = await Lesson.create({ ...data, courseId })

    // Update totalLessons in Course
    await Course.findByIdAndUpdate(courseId, { $inc: { totalLessons: 1 } })

    return lesson
  }

  static async updateLesson(id: string, data: any) {
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      throw new AppError('Lesson not found', 404)
    }

    Object.assign(lesson, data)
    await lesson.save()
    return lesson
  }

  static async deleteLesson(id: string) {
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      throw new AppError('Lesson not found', 404)
    }

    await Lesson.findByIdAndDelete(id)

    // Update totalLessons in Course
    await Course.findByIdAndUpdate(lesson.courseId, { $inc: { totalLessons: -1 } })

    // Delete related progress records
    await Progress.deleteMany({ lessonId: id })
  }

  static async submitQuiz(lessonId: string, user: IUser, answers: { questionIndex: number; selectedOption: number }[]) {
    const lesson = await Lesson.findById(lessonId).lean()
    if (!lesson) {
      throw new AppError('Lesson not found', 404)
    }

    // Verify access
    if (!lesson.isFree) {
      const hasPurchased = user.purchasedCourses.some(courseId => courseId.toString() === lesson.courseId.toString())
      if (!hasPurchased && user.role !== 'admin' && user.role !== 'editor') {
        throw new AppError('You must purchase the course to submit a quiz', 403)
      }
    }

    if (!lesson.quiz || lesson.quiz.length === 0) {
      throw new AppError('This lesson does not have a quiz', 400)
    }

    const totalQuestions = lesson.quiz.length
    let correctAnswers = 0
    const results: { questionIndex: number; selectedOption: number; correctAnswer: number; isCorrect: boolean }[] = []

    answers.forEach(answer => {
      const question = lesson.quiz[answer.questionIndex]
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedOption
        if (isCorrect) {
          correctAnswers++
        }
        results.push({
          questionIndex: answer.questionIndex,
          selectedOption: answer.selectedOption,
          correctAnswer: question.correctAnswer,
          isCorrect,
        })
      }
    })

    const score = (correctAnswers / totalQuestions) * 100
    const passed = score >= 70

    // Upsert Progress
    let progress = await Progress.findOne({ userId: user._id, lessonId: lesson._id })
    if (progress) {
      progress.quizScore = score
      if (passed && !progress.completed) {
        progress.completed = true
        progress.completedAt = new Date()
      }
      await progress.save()
    } else {
      progress = await Progress.create({
        userId: user._id,
        courseId: lesson.courseId,
        lessonId: lesson._id,
        quizScore: score,
        completed: passed,
        completedAt: passed ? new Date() : undefined,
      })
    }

    // Calculate course progress
    const completedLessonsCount = await Progress.countDocuments({ userId: user._id, courseId: lesson.courseId, completed: true })
    const course = await Course.findById(lesson.courseId).lean()
    const totalCourseLessons = course?.totalLessons || 1
    const courseProgressPercent = Math.round((completedLessonsCount / totalCourseLessons) * 100)

    return {
      score,
      passed,
      correctAnswers,
      totalQuestions,
      courseProgressPercent,
      results,
    }
  }
}
