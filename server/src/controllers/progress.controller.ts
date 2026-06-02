import { Request, Response, NextFunction } from 'express'
import { ProgressService } from '@/services/progress.service'
import { sendSuccess } from '@/lib/response'

export const completeLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = String(req.user!._id)
    const { courseId, lessonId, quizScore } = req.body

    const result = await ProgressService.completeLesson(userId, courseId, lessonId, quizScore)

    sendSuccess(res, result, { message: 'Lesson marked as completed' })
  } catch (error) {
    next(error)
  }
}

export const getCourseProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = String(req.user!._id)
    const { courseId } = req.params

    const result = await ProgressService.getCourseProgress(userId, String(courseId))

    sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}
