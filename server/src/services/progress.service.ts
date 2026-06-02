import { Progress } from '@/models/Progress'
import { Lesson } from '@/models/Lesson'
import { CertificateService } from '@/services/certificate.service'

export class ProgressService {
  /**
   * Mark a lesson as completed, update progress, and generate certificate if 100%.
   */
  static async completeLesson(userId: string, courseId: string, lessonId: string, quizScore?: number) {
    // 1. Upsert the Progress document
    await Progress.findOneAndUpdate(
      { userId, courseId, lessonId },
      {
        userId,
        courseId,
        lessonId,
        completed: true,
        quizScore: quizScore !== undefined ? quizScore : undefined,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    // 2. Recalculate progress
    // Count total lessons in this course
    const totalLessons = await Lesson.countDocuments({ courseId })
    
    // Get all user's completed lessons in this course
    const progressRecords = await Progress.find({ userId, courseId, completed: true }).lean()
    const completedLessonIds = progressRecords.map(p => p.lessonId.toString())
    
    let percentage = 0
    if (totalLessons > 0) {
      percentage = Math.round((completedLessonIds.length / totalLessons) * 100)
      // Cap at 100% just in case of stale counts
      percentage = Math.min(percentage, 100)
    }

    // 3. Generate certificate if 100% completed
    let certificate = null
    if (percentage === 100 && totalLessons > 0) {
      certificate = await CertificateService.generateCertificate(userId, courseId)
    }

    return {
      progressPercent: percentage,
      completedLessons: completedLessonIds,
      totalLessons,
      certificate,
    }
  }

  /**
   * Get the progress of a specific course for a user.
   */
  static async getCourseProgress(userId: string, courseId: string) {
    const progressRecords = await Progress.find({ userId, courseId, completed: true }).lean()
    
    const completedLessonIds = progressRecords.map(p => p.lessonId.toString())

    const totalLessons = await Lesson.countDocuments({ courseId })
    let percentage = 0
    if (totalLessons > 0) {
      percentage = Math.round((completedLessonIds.length / totalLessons) * 100)
      percentage = Math.min(percentage, 100)
    }

    return {
      progressPercent: percentage,
      completedLessons: completedLessonIds,
      totalLessons,
    }
  }
}
