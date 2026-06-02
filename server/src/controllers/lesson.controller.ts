import { Request, Response, NextFunction } from 'express'
import { LessonService } from '@/services/lesson.service'
import { sendSuccess } from '@/lib/response'

export const getCourseLessonsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params
    const lessons = await LessonService.getCourseLessons(courseId as string, req.user)

    sendSuccess(res, lessons)
  } catch (err) {
    next(err)
  }
}

export const getLessonByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const lesson = await LessonService.getLessonById(id as string, req.user)

    sendSuccess(res, { lesson })
  } catch (err) {
    next(err)
  }
}

export const createLessonController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params
    const lesson = await LessonService.createLesson(courseId as string, req.body)

    sendSuccess(res, { lesson }, { statusCode: 201, message: 'Lesson created' })
  } catch (err) {
    next(err)
  }
}

export const updateLessonController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const lesson = await LessonService.updateLesson(id as string, req.body)

    sendSuccess(res, { lesson }, { message: 'Lesson updated' })
  } catch (err) {
    next(err)
  }
}

export const deleteLessonController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    await LessonService.deleteLesson(id as string)

    sendSuccess(res, null, { message: 'Lesson deleted' })
  } catch (err) {
    next(err)
  }
}

export const submitQuizController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const result = await LessonService.submitQuiz(id as string, req.user!, req.body.answers)

    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}
