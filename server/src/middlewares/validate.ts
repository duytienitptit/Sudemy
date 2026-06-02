import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

interface ValidationSchemas {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

/**
 * Middleware factory that validates `req.body`, `req.query`, and/or `req.params`
 * against the supplied Zod schemas.
 *
 * On success: mutates req with the parsed (type-coerced) values and calls next().
 * On failure: responds 422 with structured field-level error details.
 *
 * Usage:
 *   router.post('/courses', validate({ body: createCourseSchema }), createCourse)
 *   router.get('/courses', validate({ query: listCoursesQuerySchema }), listCourses)
 */
export const validate =
  (schemas: ValidationSchemas) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body)
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params
      }
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: err.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        })
        return
      }
      next(err)
    }
  }
