import { Request, Response, NextFunction } from 'express'
import { CourseService } from '@/services/course.service'

export const getCoursesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("req.query:", req.query)
    
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      order: req.query.order as 'asc' | 'desc',
      status: req.query.status as 'draft' | 'published' | 'archived',
      minPrice: req.query.minPrice !== undefined ? parseInt(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice !== undefined ? parseInt(req.query.maxPrice as string) : undefined,
    }
    
    // Check if the user is an admin or editor
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'editor'

    const result = await CourseService.getCourses(filters, isAdmin)
    res.status(200).json({ status: 'success', data: result })
  } catch (error) {
    next(error)
  }
}

export const getCourseBySlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await CourseService.getCourseBySlug(req.params.slug as string)
    res.status(200).json({ status: 'success', data: { course } })
  } catch (error) {
    next(error)
  }
}

export const getCourseByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await CourseService.getCourseById(req.params.id as string)
    res.status(200).json({ status: 'success', data: { course } })
  } catch (error) {
    next(error)
  }
}

export const createCourseController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await CourseService.createCourse(req.body)
    res.status(201).json({ status: 'success', data: { course }, message: 'Course created' })
  } catch (error) {
    next(error)
  }
}

export const updateCourseController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await CourseService.updateCourse(req.params.id as string, req.body)
    res.status(200).json({ status: 'success', data: { course }, message: 'Course updated' })
  } catch (error) {
    next(error)
  }
}

export const updateCourseStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await CourseService.updateCourseStatus(req.params.id as string, req.body.status)
    res.status(200).json({ status: 'success', data: { course }, message: 'Status updated' })
  } catch (error) {
    next(error)
  }
}

export const deleteCourseController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CourseService.deleteCourse(req.params.id as string)
    res.status(200).json({ 
      status: 'success', 
      message: result.action === 'archived' ? 'Course archived due to existing orders' : 'Course deleted'
    })
  } catch (error) {
    next(error)
  }
}
